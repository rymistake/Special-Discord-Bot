import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import {
  PERMISSIONS,
  getManageLevelFromPermissions,
} from "../../config/permissions.js";

import {
  PERMISSION_PRESETS,
  PRESET_CHOICES,
} from "../../config/permissionPresets.js";

import { PermissionService } from "../../services/PermissionService.js";
import { SystemOperatorService } from "../../services/SystemOperatorService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("permission-preset")
  .setDescription("Apply a permission preset to a role.")
  .addRoleOption(option =>
    option
      .setName("role")
      .setDescription("The role to apply the preset to.")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("preset")
      .setDescription("The preset to apply.")
      .setRequired(true)
      .addChoices(...PRESET_CHOICES)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  const role = interaction.options.getRole("role", true);
  const presetKey = interaction.options.getString("preset", true);

  const preset = PERMISSION_PRESETS[presetKey];

  if (!preset) {
    return interaction.reply({
      content: "Unknown permission preset.",
      ephemeral: true,
    });
  }

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
    preset.permissions.includes(PERMISSIONS.PERMISSION_MANAGE_LEVEL_4) &&
    !isSystemOperator
  ) {
    return interaction.reply({
      content: "Only System Operators can assign Level 4 permission management.",
      ephemeral: true,
    });
  }

  if (preset.requiredManageLevel > actorManageLevel) {
    return interaction.reply({
      content: "You cannot assign this preset.",
      ephemeral: true,
    });
  }

  for (const permission of preset.permissions) {
    await PermissionService.grant(interaction.guildId, permission, role.id);
  }

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.PERMISSION_PRESET_APPLIED,
    title: "Permission Preset Applied",
    actorId: interaction.user.id,
    fields: [
      {
        name: "Preset",
        value: `\`${preset.name}\``,
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
      {
        name: "Permissions",
        value: preset.permissions.map(p => `\`${p}\``).join("\n").slice(0, 1024),
      },
    ],
  });

  return interaction.reply({
    content: `✅ Applied \`${preset.name}\` preset to ${role}.`,
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}