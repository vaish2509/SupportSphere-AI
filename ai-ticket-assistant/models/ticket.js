import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    default: "PENDING", // Explicitly set the default status
    enum: ["PENDING", "IN_PROGRESS", "RESOLVED"],
  },
  priority: String,
  helpfulNotes: String,
  relatedSkills: [String],
  // --- Add references to the User model ---
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ticket", ticketSchema);
