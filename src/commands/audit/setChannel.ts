import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { GuildConfigService } from "../../services/GuildConfigService.js";
import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("audit-set-channel")
  .setDescription("Set this server's audit log channel.")
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("The channel audit logs will be sent to.")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.AUDIT_MANAGE);

  const config = await GuildConfigService.get(interaction.guildId);

  if (!config) {
    return interaction.reply({
      content: "This server is not registered. Use `/server-register` first.",
      ephemeral: true,
    });
  }

  const channel = interaction.options.getChannel("channel", true);

  await GuildConfigService.setAuditChannel(interaction.guildId, channel.id);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.AUDIT_CHANNEL_SET,
    title: "Audit Channel Set",
    actorId: interaction.user.id,
    fields: [
      {
        name: "Channel",
        value: `<#${channel.id}> \`${channel.id}\``,
      },
    ],
  });

  return interaction.reply({
    content: `✅ Audit log channel set to ${channel}.`,
    ephemeral: true,
  });
}