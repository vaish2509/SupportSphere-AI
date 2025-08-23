import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, skills });

    await inngest.send({
      name: "user/signup",
      data: {
        email,
      },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// ... (rest of the file remains the same)
export const logout = async (req, res) => {
  // This is a placeholder. JWT logout is handled client-side.
  res.json({ message: "Logout endpoint hit" });
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.updateOne(
      { email },
      { 
        skills: skills.length ? skills : user.skills, 
        role: role || user.role 
      }
    );
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Fetching users failed", details: error.message });
  }
};
