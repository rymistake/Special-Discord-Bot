import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

import { ALL_PERMISSIONS, PERMISSIONS } from "../../config/permissions.js";
import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
    .setName("permission-revoke")
    .setDescription("Revoke a permission from a role.")
    .addRoleOption(option =>
        option
        .setName("role")
        .setDescription("The role to revoke the permission from.")
        .setRequired(true)
    )
    .addStringOption(option =>
        option
        .setName("permission")
        .setDescription("The permission to revoke.")
        .setRequired(true)
        .addChoices(
            ...ALL_PERMISSIONS.map(permission => ({
            name: permission,
            value: permission,
            }))
        )
    );

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

    const role = interaction.options.getRole("role", true);
    const permission = interaction.options.getString("permission", true);

    await PermissionService.revoke(interaction.guildId, permission, role.id);

    await AuditLogService.log(interaction.guild!, {
        tag: AUDIT_TAGS.PERMISSION_REVOKED,
        title: "Permission Revoked",
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
        ],
    });

    return interaction.reply({
        content: `✅ Revoked \`${permission}\` from ${role}.`,
        ephemeral: true,
    });
}