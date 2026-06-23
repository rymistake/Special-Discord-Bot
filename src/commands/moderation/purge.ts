import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("purge")
  .setDescription("Bulk delete recent messages in this channel.")
  .addIntegerOption(option =>
    option
      .setName("amount")
      .setDescription("Number of messages to delete. Max 100.")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.channel?.isTextBased()) {
    return interaction.reply({
      content: "This command can only be used in a server text channel.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.MODERATION_PURGE);

  const amount = interaction.options.getInteger("amount", true);
  const channel = interaction.channel as TextChannel;

  await interaction.deferReply({ ephemeral: true });

  const deleted = await channel.bulkDelete(amount, true);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.MODERATION_PURGE,
    title: "Messages Purged",
    actorId: interaction.user.id,
    fields: [
      {
        name: "Channel",
        value: `${channel} \`${channel.id}\``,
      },
      {
        name: "Requested Amount",
        value: String(amount),
        inline: true,
      },
      {
        name: "Deleted Amount",
        value: String(deleted.size),
        inline: true,
      },
    ],
  });

  return interaction.editReply({
    content: `✅ Deleted **${deleted.size}** message(s).`,
  });
}