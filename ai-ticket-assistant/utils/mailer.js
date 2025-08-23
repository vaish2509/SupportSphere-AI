import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text) => {
  // Ensure required environment variables are set for the mailer to work.
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.error(
      "❌ Mailer configuration is incomplete. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in your .env file."
    );
    // Silently fail in dev to avoid crashing the app, but log the error.
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${
        process.env.EMAIL_FROM_NAME || "AI Ticket Assistant"
      }" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail error", error.message);
    throw error;
  }
};
