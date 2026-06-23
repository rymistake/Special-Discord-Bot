import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { GuildConfigService } from "../../services/GuildConfigService.js";
import { getDepartmentName } from "../../config/departments.js";

export const data = new SlashCommandBuilder()
  .setName("server-status")
  .setDescription("View this server's bot registration status.");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  const config = await GuildConfigService.get(interaction.guildId);

  if (!config) {
    return interaction.reply({
      content: "This server is not registered.",
      ephemeral: true,
    });
  }

  return interaction.reply({
    content:
      `✅ This server is registered.\n` +
      `Department: **${getDepartmentName(config.departmentKey)}**`,
    ephemeral: true,
  });
}