import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { PERMISSIONS } from "../../config/permissions.js";
import { PermissionService } from "../../services/PermissionService.js";

export const data = new SlashCommandBuilder()
  .setName("permission-list")
  .setDescription("List this server's permission rules.");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
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

  const rules = await PermissionService.list(interaction.guildId);

  if (rules.length === 0) {
    return interaction.reply({
      content: "No permission rules have been configured yet.",
      ephemeral: true,
    });
  }

  const lines = rules.map(rule => {
    const roles =
      rule.roleIds.length > 0
        ? rule.roleIds.map(roleId => `<@&${roleId}>`).join(", ")
        : "No roles";

    return `\`${rule.permissionKey}\` → ${roles}`;
  });

  return interaction.reply({
    content: lines.join("\n"),
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}