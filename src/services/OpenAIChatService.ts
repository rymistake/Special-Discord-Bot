import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIChatService {
  static async respond(prompt: string) {
    const response = await openai.responses.create({
      model: "gpt-5.5-mini",
      input: [
        {
          role: "system",
          content:
            "You are IRiS, a helpful Discord assistant for an SCP-style Roblox community. Keep replies concise, useful, and in-character but not overly roleplay-heavy.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.output_text;
  }
}