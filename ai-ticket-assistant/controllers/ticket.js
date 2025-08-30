import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

// ... (keep the existing createTicket, getTickets, getTicket functions)

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets;
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", "email _id")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      // Admins and moderators can view any ticket
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", "email _id");
    } else {
      // A regular user can only view a ticket they created
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).populate("assignedTo", "email _id");
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found or you do not have permission to view it." });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// --- NEW FUNCTION ---
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;
    const user = req.user;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Only allow admins or the assigned moderator to change the status
    if (
      user.role !== "admin" &&
      ticket.assignedTo?.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this ticket" });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({ message: "Ticket status updated", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
