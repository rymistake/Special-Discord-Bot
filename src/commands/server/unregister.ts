import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { GuildConfigService } from "../../services/GuildConfigService.js";
import { SystemOperatorService } from "../../services/SystemOperatorService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("server-unregister")
  .setDescription("Unregister this server from the bot system.");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  const isOperator = await SystemOperatorService.isSystemOperator(
    interaction.user.id
  );

  if (!isOperator) {
    return interaction.reply({
      content: "Only System Operators can unregister servers.",
      ephemeral: true,
    });
  }

  await GuildConfigService.unregister(interaction.guildId);

  await AuditLogService.log(interaction.guild!, {
    tag: AUDIT_TAGS.SERVER_UNREGISTERED,
    title: "Server Unregistered",
    description: "Server unregistered from the bot system.",
    actorId: interaction.user.id,
  });

  return interaction.reply({
    content: "✅ Server unregistered.",
    ephemeral: true,
  });
}