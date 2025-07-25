import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // Step 1: Fetch the ticket from the database.
      const ticket = await step.run("fetch-ticket-by-id", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // Step 2: Call the AI agent directly.
      // The agent.run() call inside analyzeTicket is already an Inngest step,
      // so we don't wrap it in another step.run().
      const aiResponse = await analyzeTicket(ticket);

      // Step 3: Update ticket, find a moderator, and assign them.
      const moderator = await step.run("process-and-assign", async () => {
        let assignedUser = null;

        // First, update the ticket with the AI's analysis.
        if (aiResponse && aiResponse.relatedSkills) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });

          // Now, find a moderator with the required skills.
          assignedUser = await User.findOne({
            role: "moderator",
            skills: {
              $in: aiResponse.relatedSkills.map(skill => new RegExp(skill, 'i'))
            },
          });
        }
        
        // If no skilled moderator is found, assign to any admin.
        if (!assignedUser) {
          assignedUser = await User.findOne({ role: "admin" });
        }

        // Finally, update the ticket with the assignment.
        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: assignedUser?._id || null,
        });

        return assignedUser;
      });

      // Step 4: Send an email notification if a moderator was assigned.
      await step.run("send-assignment-email", async () => {
        if (moderator) {
          const subject = `New Ticket Assigned: "${ticket.title}"`;
          const message = `Hi ${moderator.email},\n\nA new ticket has been assigned to you.\n\nTitle: ${ticket.title}\nPriority: ${aiResponse?.priority || 'Not set'}\n\nPlease log in to view the details.`;
          await sendMail(moderator.email, subject, message);
        }
      });

      return { success: true, message: "Ticket processed successfully." };
    } catch (err) {
      console.error("❌ Error in on-ticket-created function:", err.message);
      throw err; // Re-throw to allow Inngest to handle retries.
    }
  }
);
