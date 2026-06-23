import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";
import { TempBanService } from "../../services/TempBanService.js";

export const data = new SlashCommandBuilder()
  .setName("unban")
  .setDescription("Unban a user by ID.")
  .addStringOption(option =>
    option
      .setName("user-id")
      .setDescription("Discord user ID to unban.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("Reason for the unban.")
      .setRequired(false)
      .setMaxLength(1000)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.MODERATION_BAN);

  const userId = interaction.options.getString("user-id", true);
  const reason =
    interaction.options.getString("reason", false) ?? "No reason provided.";

  await interaction.guild.members.unban(userId, reason);

  await TempBanService.deactivateForUser(interaction.guild.id, userId);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.MODERATION_BAN,
    title: "User Unbanned",
    actorId: interaction.user.id,
    targetId: userId,
    fields: [{ name: "Reason", value: reason }],
  });

  return interaction.reply({
    content: `✅ Unbanned \`${userId}\`.`,
    ephemeral: true,
  });
}