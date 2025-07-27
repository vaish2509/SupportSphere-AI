import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createTicket,
  getTicket,
  getTickets,
  updateTicketStatus, // Import the new function
} from "../controllers/ticket.js";

const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);

// --- NEW ROUTE ---
// Use PATCH for partial updates like changing the status
router.patch("/:id/status", authenticate, updateTicketStatus);

export default router;
