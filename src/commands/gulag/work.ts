import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { IsolationService } from "../../services/IsolationService.js";

export const data = new SlashCommandBuilder()
  .setName("work")
  .setDescription("Gather coal while in Gulag.");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  const member = await interaction.guild.members.fetch(interaction.user.id);

  try {
    const result = await IsolationService.addCoal(member);

    if (result.completed) {
      return interaction.reply({
        content: `⛏️ You gathered coal and reached your goal: **${result.coal}/${result.goal}**. Freedom at last!.`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `⛏️ You gathered **1 coal**. Progress: **${result.coal}/${result.goal}**.`,
      ephemeral: true,
    });
  } catch {
    return interaction.reply({
      content: "You are not in Gulag.",
      ephemeral: true,
    });
  }
}
