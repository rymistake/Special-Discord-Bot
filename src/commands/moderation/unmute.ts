import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";

import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("Remove a user's timeout.")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("User to unmute.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("Reason for the unmute.")
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

  await PermissionService.require(interaction, PERMISSIONS.MODERATION_MUTE);

  const user = interaction.options.getUser("user", true);
  const reason =
    interaction.options.getString("reason", false) ?? "No reason provided.";

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "That user is not in this server.",
      ephemeral: true,
    });
  }

  await (member as GuildMember).timeout(null, reason);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.MODERATION_MUTE,
    title: "User Unmuted",
    actorId: interaction.user.id,
    targetId: user.id,
    fields: [{ name: "Reason", value: reason }],
  });

  return interaction.reply({
    content: `✅ Unmuted ${user}.`,
    ephemeral: true,
    allowedMentions: { parse: [] },
  });
}