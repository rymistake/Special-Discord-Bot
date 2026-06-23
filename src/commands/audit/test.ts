import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("audit-test")
  .setDescription("Send a test audit log.");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.AUDIT_MANAGE);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.AUDIT_CHANNEL_SET,
    title: "Audit Log Test",
    description: "If you can see this, audit logs are working.",
    actorId: interaction.user.id,
  });

  return interaction.reply({
    content: "✅ Test audit log sent.",
    ephemeral: true,
  });
}