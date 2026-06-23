import { Message, TextChannel } from "discord.js";

export class AIContextService {
  static async getChannelContext(message: Message) {
    if (!message.guild || !(message.channel instanceof TextChannel)) {
      return "";
    }

    const recentMessages = await message.channel.messages.fetch({
      limit: 15,
    });

    const lines = [...recentMessages.values()]
      .reverse()
      .filter(msg => msg.content.trim().length > 0)
      .filter(msg => !msg.author.bot || msg.author.id === message.client.user?.id)
      .map(msg => {
        const author =
          msg.author.id === message.client.user?.id
            ? "IRiS"
            : msg.member?.displayName ?? msg.author.username;

        return `${author}: ${msg.content}`;
      });

    return lines.join("\n").slice(0, 4000);
  }
}