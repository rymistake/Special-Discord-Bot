export const AI_MEDIA = [
  {
    id: "AURA",
    filePath: "src/assets/ai-media/AURA.mp3",
    type: "audio",
    description:
      "Use when showin off your 'aura', or mockingly towards someone who tries to act tough.",
  },
  {
    id: "dexter",
    filePath: "src/assets/ai-media/dexter.gif",
    type: "gif",
    description:
      "Use when suspicious or you want to let them know you're watchihg.",
  },
    {
    id: "gambling",
    filePath: "src/assets/ai-media/gambling.gif",
    type: "gif",
    description:
      "Gambling!",
  },
      {
    id: "gem",
    filePath: "src/assets/ai-media/gem.gif",
    type: "gif",
    description:
      "Use when someone says something that can only be defined as a 'gem' (rare find, inteersting) - special in a funny way basically",
  },
    {
    id: "impressed",
    filePath: "src/assets/ai-media/impressed.gif",
    type: "gif",
    description:
      "Use when impressed",
  },
    {
    id: "low-cortisol",
    filePath: "src/assets/ai-media/low-cortisol.gif",
    type: "gif",
    description:
      "When continously insulted, use it to show that you do not care!",
  },
      {
    id: "metal-pipe-falling",
    filePath: "src/assets/ai-media/metal-pipe-falling.mp3",
    type: "audio",
    description:
      "Metal pipe falling sound, so funny",
  },
{
    id: "moneyyy",
    filePath: "src/assets/ai-media/moneyyy.mp3",
    type: "audio",
    description:
      "Sound to use moments before disaster, when you're about to go on a serious topic",
  },
  {
    id: "wow",
    filePath: "src/assets/ai-media/wow.gif",
    type: "gif",
    description:
      "Wow, when someone does says something so out of pocket or outrageous",
  },
    {
    id: "yippee",
    filePath: "src/assets/ai-media/yippee.mp3",
    type: "audio",
    description:
      "Yippee, express happiness!",
  },
] as const;

export function getAIMediaListText() {
  return AI_MEDIA
    .map(media => `- ${media.id}: ${media.description}`)
    .join("\n");
}

export function getAIMediaById(id: string) {
  return AI_MEDIA.find(media => media.id === id) ?? null;
}