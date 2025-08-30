import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

// Helper function to generate a JWT
const generateToken = (user) => {
  return jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d", // Token will expire in 1 day
  });
};

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    // Check if user already exists to provide a clearer error
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, skills });

    await inngest.send({
      name: "user/signup",
      data: {
        email,
      },
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Signup Error:", error); // Log the full error on the server
    res.status(500).json({ error: "An unexpected error occurred during signup." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login Error:", error); // Log the full error on the server
    res.status(500).json({ error: "An unexpected error occurred during login." });
  }
};

// ... (rest of the file remains the same)
export const logout = (req, res) => {
  // For JWT-based auth, logout is primarily a client-side operation where
  // the token is deleted from localStorage or cookies. This endpoint is
  // provided for completeness and can be used to trigger server-side
  // cleanup if needed in the future (e.g., with a token blocklist).
  res.status(200).json({ message: "Logout successful" });
};

export const updateUser = async (req, res) => {
  const { skills, role, email } = req.body;
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not have permission to perform this action." });
    }
    if (!email) {
      return res.status(400).json({ error: "User email is required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build the update object to only change provided fields
    const updateFields = {};
    if (role) updateFields.role = role;
    // Allows clearing skills by passing an empty array
    if (typeof skills !== "undefined") updateFields.skills = skills;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields to update were provided." });
    }

    await User.updateOne({ email }, { $set: updateFields });
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update User Error:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred while updating the user." });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not have permission to perform this action." });
    }

    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ error: "An unexpected error occurred while fetching users." });
  }
};
