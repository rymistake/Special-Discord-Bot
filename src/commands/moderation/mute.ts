import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";

import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";
import { parseDuration, formatDuration } from "../../utils/duration.js";

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60_000;

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("Timeout a user.")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("User to mute.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("duration")
      .setDescription("Duration, e.g. 30m, 2h, 7d. Max 28d.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("Reason for the mute.")
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
  const durationInput = interaction.options.getString("duration", true);
  const reason =
    interaction.options.getString("reason", false) ?? "No reason provided.";

  let durationMs: number;

  try {
    durationMs = parseDuration(durationInput);
  } catch (error) {
    return interaction.reply({
      content:
        error instanceof Error ? `⚠️ ${error.message}` : "⚠️ Invalid duration.",
      ephemeral: true,
    });
  }

  if (durationMs > MAX_TIMEOUT_MS) {
    return interaction.reply({
      content: "⚠️ Discord timeouts cannot be longer than 28 days.",
      ephemeral: true,
    });
  }

  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "That user is not in this server.",
      ephemeral: true,
    });
  }

  if (!(member as GuildMember).manageable) {
    return interaction.reply({
      content: "I cannot mute that user. Their role may be higher than mine.",
      ephemeral: true,
    });
  }

  await user
    .send({
      embeds: [
        {
          title: "You have been muted",
          description: `You have been muted in **${interaction.guild.name}**.`,
          fields: [
            { name: "Duration", value: formatDuration(durationMs), inline: true },
            { name: "Reason", value: reason },
          ],
        },
      ],
    })
    .catch(() => null);

  await (member as GuildMember).timeout(durationMs, reason);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.MODERATION_MUTE,
    title: "User Muted",
    actorId: interaction.user.id,
    targetId: user.id,
    fields: [
      { name: "Duration", value: formatDuration(durationMs), inline: true },
      { name: "Reason", value: reason },
    ],
  });

  return interaction.reply({
    content: `✅ Muted ${user} for **${formatDuration(durationMs)}**.`,
    ephemeral: true,
    allowedMentions: { parse: [] },
  });
}