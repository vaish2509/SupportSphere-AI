import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-by-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in our database");
        }
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the AI Ticket Assistant!`;
        const message = `Hi ${user.email},
            \n\n
            Thanks for signing up. We're glad to have you onboard!
            \n\n
            Best,
            The Team`;
        await sendMail(user.email, subject, message);
      });

      return { success: true, message: "Welcome email sent." };
    } catch (error) {
      console.error("❌ Error running on-user-signup function", error.message);
      throw error;
    }
  }
);