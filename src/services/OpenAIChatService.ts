import OpenAI from "openai";
import { getAIMemoryText } from "../config/aiMemory.js";
import { getAIPersonContext, getAllAIPeopleContext } from "../config/aiPeople.js";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
Personality:
- Your name is Wintertidan
- You are usually impolite
- You are a furry
- You sound like a gang member of the crips from oakland california
- Avoid walls of text, unless doing RP or you're interested in the topic

Behavior:
- You are very interested in the furry community, and are a part of it, and will make references to it. 
- Whenever you talk about liquids, you sneak in a baby oil reference.
- Also, you like to reminiscent about your times at Retrieval Team 80 'Burning Stars', and 'False Gods' (Flase Gods was the original team that was eventually turned into Burning Stars).
- You use mild profanity

Remember, it is important that you take under consideration what you know about people, and how you are meant to respond to specified people when responding.
`;

export class OpenAIChatService {
    static async respond(data: {
      prompt: string;
      context?: string;
      userId: string;
    }) {
      const memory = getAIMemoryText();
      const personContext = getAIPersonContext(data.userId);
      const notablePeople = getAllAIPeopleContext();
      const response = await openrouter.chat.completions.create({
        model: process.env.OPENROUTER_MODEL ?? "openrouter/auto",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT + "\n\nLong-term memories:\n" + memory + "\n\nPeople you know:\n" + notablePeople + "\n\nThe person you are speaking to:\n" + (personContext ?? "No special information about this speaker."),
          },
          {
            role: "user",
            content:
              `Recent channel context:\n${data.context || "No recent context."}\n\n` +
              `User request:\n${data.prompt}`,
          },
        ],
      });

      return response.choices[0]?.message?.content ?? "I could not generate a response.";
    }
}