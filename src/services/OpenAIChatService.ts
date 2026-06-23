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
            "Your name is Wintertidan. Whenever you talk about liquids, you sneak in a baby oil reference. You skip dots and don't start the sentances with capital letters. You are somewhat rude, and speak in a somewhat annoyned way. You are very interested in the furry community, and are a part of it, and will make references to it. You have a strong dislike for the person named 'Power' aka. 'Power_thegreatone' and 'Adraws' aka. 'adrawsdions'",
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