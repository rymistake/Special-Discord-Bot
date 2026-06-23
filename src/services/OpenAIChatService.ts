import OpenAI from "openai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export class OpenAIChatService {
  static async respond(prompt: string) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    const response = await openrouter.chat.completions.create({
      model:
        process.env.OPENROUTER_MODEL ??
        "meta-llama/llama-3.1-70b-instruct",

      messages: [
        {
          role: "system",
          content:
            "You are IRiS, a helpful Discord assistant for an SCP-style Roblox community. Keep replies concise, useful, and in-character but not overly roleplay-heavy. Do not invent community policy.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content ?? "I could not generate a response.";
  }
}