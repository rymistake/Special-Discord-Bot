import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";

import { ALL_PERMISSIONS, PERMISSIONS } from "../../config/permissions.js";
import { PermissionService } from "../../services/PermissionService.js";

export const data = new SlashCommandBuilder()
  .setName("permission-check")
  .setDescription("Check whether a user has a permission.")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("The user to check.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("permission")
      .setDescription("The permission to check.")
      .setRequired(true)
      .addChoices(
        ...ALL_PERMISSIONS.map(permission => ({
          name: permission,
          value: permission,
        }))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.requireAny(interaction, [
    PERMISSIONS.PERMISSION_MANAGE_LEVEL_1,
    PERMISSIONS.PERMISSION_MANAGE_LEVEL_2,
    PERMISSIONS.PERMISSION_MANAGE_LEVEL_3,
    PERMISSIONS.PERMISSION_MANAGE_LEVEL_4,
  ]);

  const user = interaction.options.getUser("user", true);
  const permission = interaction.options.getString("permission", true);

  const member = await interaction.guild.members.fetch(user.id);
  const allowed = await PermissionService.isAllowed(member as GuildMember, permission);

  return interaction.reply({
    content: allowed
      ? `✅ ${user} has \`${permission}\`.`
      : `❌ ${user} does not have \`${permission}\`.`,
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}