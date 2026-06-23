import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { PermissionService } from "../../services/PermissionService.js";
import { GuildConfigService } from "../../services/GuildConfigService.js";
import { PERMISSIONS } from "../../config/permissions.js";

export const data = new SlashCommandBuilder()
  .setName("gulag-config")
  .setDescription("Configure the isolation system.")
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Gulag channel.")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addRoleOption(option =>
    option
      .setName("role")
      .setDescription("Gulag role.")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.JAIL_MANAGE);

  const channel = interaction.options.getChannel("channel", true);
  const role = interaction.options.getRole("role", true);

  await GuildConfigService.setIsolationConfig(interaction.guildId, {
    isolationChannelId: channel.id,
    isolationRoleId: role.id,
  });

  return interaction.reply({
    content: `✅ Gulag configured.\nChannel: ${channel}\nRole: ${role}`,
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
} 
