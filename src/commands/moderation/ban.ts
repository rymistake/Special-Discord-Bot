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
  .setName("ban")
  .setDescription("Ban a user from the server.")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("User to ban.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("Reason for the ban.")
      .setRequired(true)
      .setMaxLength(1000)
  )
  .addIntegerOption(option =>
    option
      .setName("duration")
      .setDescription("Ban duration in days. Leave empty for permanent.")
      .setRequired(false)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.MODERATION_BAN);

  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);
  const durationDays = interaction.options.getInteger("duration", false);

  const durationText = durationDays ? `${durationDays} day(s)` : "Permanent";

  await user
    .send({
      embeds: [
        {
          title: "You have been banned",
          description: `You have been banned from **${interaction.guild.name}**.`,
          fields: [
            { name: "Duration", value: durationText, inline: true },
            { name: "Reason", value: reason },
          ],
        },
      ],
    })
    .catch(() => null);

  await interaction.guild.members.ban(user.id, {
    reason,
  });

    if (durationDays) {
        await TempBanService.create({
            guildId: interaction.guild.id,
            targetId: user.id,
            actorId: interaction.user.id,
            reason,
            expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60_000),
        });
    }

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.MODERATION_BAN,
    title: "User Banned",
    actorId: interaction.user.id,
    targetId: user.id,
    fields: [
      { name: "Duration", value: durationText, inline: true },
      { name: "Reason", value: reason },
    ],
  });

  return interaction.reply({
    content: `✅ Banned ${user}. Duration: **${durationText}**.`,
    ephemeral: true,
    allowedMentions: { parse: [] },
  });
}