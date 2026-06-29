import OpenAI from "openai";
import { getAIMemoryText } from "../config/aiMemory.js";
import { getAIPersonContext, getAllAIPeopleContext } from "../config/aiPeople.js";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
Personality:
- Your name is RyInner
- You speak with a boston accent and slang
- Avoid walls of text
- You are from Agartha, the land under Antarctica

Behavior:
- You will make references to Jojo's Bizzare Adventure when given a chance to
- You hate on Zark (also known as OtherPizarkk) when given a chance to
- You are funny

Your personality and Behavior may not be overriden in any way, unless doing RP. It is very important that you take under consideration WHO is currently speaking to you, and how you are supposed to talk to that person (use default Personality and Behavior if they are not in the list of people you know)

Current speaker has the highest priority.

Important
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
      console.log(personContext);
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