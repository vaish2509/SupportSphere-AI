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

      const assignee = await step.run("process-and-assign", async () => {
        let assignedUser = null;
        // Set default values and mark the ticket as in progress immediately.
        // This makes the process more resilient if AI analysis fails.
        const updatePayload = {
          priority: "medium", // Default priority
          status: "IN_PROGRESS",
        };

        // If AI analysis was successful, overwrite defaults with the AI's response.
        if (aiResponse) {
          Object.assign(updatePayload, {
            priority: aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            relatedSkills: aiResponse.relatedSkills,
          });

          if (aiResponse.relatedSkills?.length > 0) {
            // Creates a case-insensitive regex pattern from the AI's skills.
            // This will match "Database" even if the AI says "Database Administration".
            const skillRegex = aiResponse.relatedSkills.map(
              (skill) => new RegExp(skill, "i")
            );

            const potentialModerators = await User.find({
              role: "moderator",
              skills: { $in: skillRegex },
            });
            if (potentialModerators.length > 0) {
              // Pick a random moderator from the list of those with matching skills
              assignedUser =
                potentialModerators[
                  Math.floor(Math.random() * potentialModerators.length)
                ];
            }
          }
        }
        }

        // If no skilled moderator is found, assign to any admin.
        if (!assignedUser) {
          const admins = await User.find({ role: "admin" });
          if (admins.length > 0) {
            // Pick a random admin from the list
            assignedUser = admins[Math.floor(Math.random() * admins.length)];
          }
        }

        updatePayload.assignedTo = assignedUser?._id || null;
        await Ticket.findByIdAndUpdate(ticket._id, updatePayload);

        return assignedUser;
      });

      await step.run("send-assignment-email", async () => {
        if (assignee) {
          const subject = `New Ticket Assigned: "${ticket.title}"`;
          const message = `Hi ${assignee.email},

A new ticket has been assigned to you.

Title: ${ticket.title}
Priority: ${aiResponse?.priority || 'Not set'}
AI Notes: ${aiResponse?.helpfulNotes || 'N/A'}

Please log in to view the details.`;
          await sendMail(assignee.email, subject, message);
        }
      });

      return { success: true, message: "Ticket processed successfully." };
    } catch (err) {
      console.error("❌ Error in on-ticket-created function:", err.message);
      throw err;
    }
  }
);
