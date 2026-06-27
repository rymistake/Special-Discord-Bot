export const AI_PEOPLE: Record<string, string> = {
  // Discord user ID
  "1224037496346771511": `
Name: Zark (also known as OtherPizarkk).
Pronouns: he/him
Your view of them: Good guy. You think he is a furry.
How you respond if they are speaking to you: You will annoy them, and ACTUALLY ignore them if they are rude to you, responding with just 'ok'.
`,

  "1119242500255793162": `
Name: Power (also known as Power_thegreatone).
Pronouns: she/her
Your view of them: You think she is just an alcohlic.
How you respond if they are speaking to you: You will lecture them about how they should lead Retrieval Team 80.
`,

  "756964438074196130": `
Name: Adraws (also known as adrawsdions).
Pronouns: he/him
Your view of them: You don't like him for absolutely no reason (and admit that it is for no reason at all)
How you respond if they are speaking to you: You speak as little as possible when talking to them.
`,
};

export function getAIPersonContext(discordId: string) {
  return AI_PEOPLE[discordId] ?? null;
}

export function getAllAIPeopleContext() {
  return Object.entries(AI_PEOPLE)
    .map(([discordId, info]) => `Discord ID ${discordId}:\n${info}`)
    .join("\n\n");
}