import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from your .env file
dotenv.config();

const analyzeTicket = async (ticket) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY not found.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // This configuration tells the model to output a JSON object.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        response_mime_type: "application/json",
      },
    });

    const prompt = `
      You are an expert ticket analysis system. Analyze the following support ticket.
      
      Ticket Title: ${ticket.title}
      Ticket Description: ${ticket.description}

      Provide a JSON object with the following keys:
      - "priority": A string, either "low", "medium", or "high".
      - "helpfulNotes": A string containing a detailed technical explanation for the moderator.
      - "relatedSkills": An array of strings with relevant skills (e.g., ["React", "MongoDB"]).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();

    // Because we requested JSON, we can parse it directly.
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("❌ Error analyzing ticket with Gemini:", error.message);
    return null;
  }
};

export default analyzeTicket;
