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

      const ticket = await step.run("fetch-ticket-by-id", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      const aiResponse = await analyzeTicket(ticket);

      const moderator = await step.run("process-and-assign", async () => {
        let assignedUser = null;
        const updatePayload = {};

        if (aiResponse && aiResponse.relatedSkills) {
          Object.assign(updatePayload, {
            priority: aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });

          // --- Corrected Skill Matching Logic ---
          // Creates a case-insensitive regex pattern from the AI's skills.
          // This will match "Database" even if the AI says "Database Administration".
          const skillRegex = aiResponse.relatedSkills.map(
            (skill) => new RegExp(skill, "i")
          );

          if (skillRegex.length > 0) {
            assignedUser = await User.findOne({
              role: "moderator",
              skills: { $in: skillRegex },
            });
          }
          // --- End of Correction ---
        }

        // If no skilled moderator is found, assign to any admin.
        if (!assignedUser) {
          assignedUser = await User.findOne({ role: "admin" });
        }

        updatePayload.assignedTo = assignedUser?._id || null;
        await Ticket.findByIdAndUpdate(ticket._id, updatePayload);

        return assignedUser;
      });

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
      throw err;
    }
  }
);
