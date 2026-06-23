import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js";

import { WarningService } from "../../services/WarningService.js";
import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";

import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

const PAGE_SIZE = 5;

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Manage user warnings.")
  .addSubcommand(subcommand =>
    subcommand
      .setName("issue")
      .setDescription("Issue a warning to a user.")
      .addUserOption(option =>
        option
          .setName("user")
          .setDescription("User to warn.")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("reason")
          .setDescription("Reason for the warning.")
          .setRequired(true)
          .setMaxLength(1000)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("list")
      .setDescription("List warnings for a user.")
      .addUserOption(option =>
        option
          .setName("user")
          .setDescription("User whose warnings should be listed.")
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("revoke")
      .setDescription("Revoke an active warning.")
      .addStringOption(option =>
        option
          .setName("warn-id")
          .setDescription("Warning ID from /warn list.")
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("reason")
          .setDescription("Reason for revoking the warning.")
          .setRequired(true)
          .setMaxLength(1000)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "issue") return issueWarning(interaction);
  if (subcommand === "list") return listWarnings(interaction);
  if (subcommand === "revoke") return revokeWarning(interaction);
}

async function issueWarning(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId || !interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.MODERATION_WARN);

  const user = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason", true);

  const warning: any = await WarningService.issue({
    guildId: interaction.guildId,
    targetId: user.id,
    actorId: interaction.user.id,
    reason,
  });

  await user
    .send({
      embeds: [
        {
          title: "Warning Issued",
          description: `You have received a warning in **${interaction.guild.name}**.`,
          fields: [
            {
              name: "Reason",
              value: reason,
            },
          ],
        },
      ],
    })
    .catch(() => null);

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.MODERATION_WARN,
    title: "Warning Issued",
    actorId: interaction.user.id,
    targetId: user.id,
    fields: [
      {
        name: "Warning ID",
        value: `\`${warning._id.toString()}\``,
      },
      {
        name: "Reason",
        value: reason,
      },
    ],
  });

  return interaction.reply({
    content:
      `✅ Warned ${user}.\n` +
      `Warning ID: \`${warning._id.toString()}\`\n` +
      `Reason: ${reason}`,
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}

async function listWarnings(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.MODERATION_WARN);

  const user = interaction.options.getUser("user", true);
  const warnings = await WarningService.list(interaction.guildId, user.id);

  if (warnings.length === 0) {
    return interaction.reply({
      content: `${user} has no warnings in this server.`,
      ephemeral: true,
      allowedMentions: {
        parse: [],
      },
    });
  }

  let page = 0;
  const totalPages = Math.ceil(warnings.length / PAGE_SIZE);

  const buildContent = () => {
    const pageWarnings = warnings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const lines = pageWarnings.map((warning: any, index: number) => {
      const number = page * PAGE_SIZE + index + 1;

      return (
        `**${number}. Warning**\n` +
        `ID: \`${warning._id.toString()}\`\n` +
        `Issued by: <@${warning.actorId}>\n` +
        `Reason: ${warning.reason}\n` +
        `Issued: <t:${Math.floor(warning.createdAt.getTime() / 1000)}:R>` 
      );
    });

    return (
      `⚠️ **Warnings for ${user.tag}**\n` +
      `Page **${page + 1}/${totalPages}**\n\n` +
      lines.join("\n\n")
    );
  };

  const buildButtons = () =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("warn_list_prev")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("warn_list_next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages - 1)
    );

  const reply = await interaction.reply({
    content: buildContent(),
    components: totalPages > 1 ? [buildButtons()] : [],
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
    fetchReply: true,
  });

  if (totalPages <= 1) return;

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60_000,
  });

  collector.on("collect", async buttonInteraction => {
    if (buttonInteraction.user.id !== interaction.user.id) {
      return buttonInteraction.reply({
        content: "This pagination menu is not for you.",
        ephemeral: true,
      });
    }

    if (buttonInteraction.customId === "warn_list_prev") {
      page = Math.max(0, page - 1);
    }

    if (buttonInteraction.customId === "warn_list_next") {
      page = Math.min(totalPages - 1, page + 1);
    }

    await buttonInteraction.update({
      content: buildContent(),
      components: [buildButtons()],
      allowedMentions: {
        parse: [],
      },
    });
  });

  collector.on("end", async () => {
    await interaction.editReply({
      components: [],
    }).catch(() => null);
  });
}

async function revokeWarning(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId || !interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.MODERATION_WARN);

  const warningId = interaction.options.getString("warn-id", true);
  const reason = interaction.options.getString("reason", true);

  const warning: any = await WarningService.revoke({
    guildId: interaction.guildId,
    warningId,
  });

  if (!warning) {
    return interaction.reply({
      content: "No active warning with that ID was found in this server.",
      ephemeral: true,
    });
  }

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.MODERATION_WARN,
    title: "Warning Revoked",
    actorId: interaction.user.id,
    targetId: warning.targetId,
    fields: [
      {
        name: "Warning ID",
        value: `\`${warning._id.toString()}\``,
      },
      {
        name: "Revoke Reason",
        value: reason,
      },
    ],
  });

  return interaction.reply({
    content: `✅ Revoked warning \`${warning._id.toString()}\`.`,
    ephemeral: true,
  });
}