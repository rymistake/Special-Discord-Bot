import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { GuildConfigService } from "../../services/GuildConfigService.js";
import { PermissionService } from "../../services/PermissionService.js";
import { PERMISSIONS } from "../../config/permissions.js";

export const data = new SlashCommandBuilder()
  .setName("audit-status")
  .setDescription("View this server's audit log configuration.");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.AUDIT_MANAGE);

  const config = await GuildConfigService.get(interaction.guildId);

  if (!config) {
    return interaction.reply({
      content: "This server is not registered.",
      ephemeral: true,
    });
  }

  return interaction.reply({
    content: config.auditLogChannelId
      ? `Audit channel: <#${config.auditLogChannelId}>`
      : "No audit channel has been set.",
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}