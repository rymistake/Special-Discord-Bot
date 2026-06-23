import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  PermissionKey,
  getManageLevelFromPermissions,
  getPermissionLevel,
} from "../../config/permissions.js";

import { PermissionService } from "../../services/PermissionService.js";
import { SystemOperatorService } from "../../services/SystemOperatorService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("permission-grant")
  .setDescription("Grant a permission to a role.")
  .addRoleOption(option =>
    option
      .setName("role")
      .setDescription("The role to grant the permission to.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("permission")
      .setDescription("The permission to grant.")
      .setRequired(true)
      .addChoices(
        ...ALL_PERMISSIONS.map(permission => ({
          name: permission,
          value: permission,
        }))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  const role = interaction.options.getRole("role", true);
  const permission = interaction.options.getString("permission", true) as PermissionKey;

  const isSystemOperator = await SystemOperatorService.isSystemOperator(
    interaction.user.id
  );

  const actorMember = await interaction.guild.members.fetch(interaction.user.id);

  if (!isSystemOperator && role.position >= actorMember.roles.highest.position) {
    return interaction.reply({
      content: "You cannot manage permissions for a role equal to or higher than your highest role.",
      ephemeral: true,
    });
  }

  const actorPermissions = await PermissionService.getPermissionsForMember(actorMember);
  const actorManageLevel = isSystemOperator
    ? 999
    : getManageLevelFromPermissions(actorPermissions);

  if (actorManageLevel <= 0) {
    return interaction.reply({
      content: "You do not have permission management access.",
      ephemeral: true,
    });
  }

  if (
    permission === PERMISSIONS.PERMISSION_MANAGE_LEVEL_4 &&
    !isSystemOperator
  ) {
    return interaction.reply({
      content: "Only System Operators can grant Level 4 permission management.",
      ephemeral: true,
    });
  }

  const permissionLevel = getPermissionLevel(permission);

  if (permissionLevel > actorManageLevel) {
    return interaction.reply({
      content: "You cannot grant permissions above your permission management level.",
      ephemeral: true,
    });
  }

  await PermissionService.grant(interaction.guildId, permission, role.id);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.PERMISSION_GRANTED,
    title: "Permission Granted",
    actorId: interaction.user.id,
    fields: [
      {
        name: "Permission",
        value: `\`${permission}\``,
        inline: true,
      },
      {
        name: "Role",
        value: `${role} \`${role.id}\``,
        inline: true,
      },
      {
        name: "Actor Manage Level",
        value: isSystemOperator ? "System Operator" : String(actorManageLevel),
        inline: true,
      },
    ],
  });

  return interaction.reply({
    content: `✅ Granted \`${permission}\` to ${role}.`,
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}