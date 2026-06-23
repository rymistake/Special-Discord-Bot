import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { StickyService } from "../../services/StickyService.js";
import { PermissionService } from "../../services/PermissionService.js";
import { AuditLogService } from "../../services/AuditLogService.js";

import { PERMISSIONS } from "../../config/permissions.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

const PAGE_SIZE = 8;

function parseColor(input: string | null) {
  if (!input) return 0x0f0f0f;

  const cleaned = input.replace("#", "").replace("0x", "");

  const parsed = Number.parseInt(cleaned, 16);

  if (Number.isNaN(parsed) || parsed < 0 || parsed > 0xffffff) {
    throw new Error("Invalid color. Use something like `0x0f0f0f` or `#0f0f0f`.");
  }

  return parsed;
}

export const data = new SlashCommandBuilder()
  .setName("sticky")
  .setDescription("Manage sticky channel embeds.")
  .addSubcommand(subcommand =>
    subcommand
      .setName("create")
      .setDescription("Create or replace a sticky embed in a channel.")
      .addChannelOption(option =>
        option
          .setName("channel")
          .setDescription("Channel where the sticky should exist.")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("title")
          .setDescription("Sticky embed title.")
          .setRequired(true)
          .setMaxLength(256)
      )
      .addStringOption(option =>
        option
          .setName("description")
          .setDescription("Sticky embed description.")
          .setRequired(true)
          .setMaxLength(4000)
      )
      .addStringOption(option =>
        option
          .setName("color")
          .setDescription("Optional color, e.g. 0x0f0f0f or #0f0f0f.")
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("delete")
      .setDescription("Delete a sticky from a channel.")
      .addChannelOption(option =>
        option
          .setName("channel")
          .setDescription("Channel whose sticky should be deleted.")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("list")
      .setDescription("List sticky embeds in this server.")
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "create") return createSticky(interaction);
  if (subcommand === "delete") return deleteSticky(interaction);
  if (subcommand === "list") return listStickies(interaction);
}

async function createSticky(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId || !interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.STICKY_MANAGE);

  const channel = interaction.options.getChannel("channel", true) as TextChannel;
  const title = interaction.options.getString("title", true);
  const description = interaction.options.getString("description", true);
  const colorInput = interaction.options.getString("color", false);

  let color: number;

  try {
    color = parseColor(colorInput);
  } catch (error) {
    return interaction.reply({
      content:
        error instanceof Error
          ? `⚠️ ${error.message}`
          : "⚠️ Invalid color.",
      ephemeral: true,
    });
  }

  const sticky = await StickyService.create({
    guildId: interaction.guildId,
    channel,
    title,
    description,
    color,
    createdBy: interaction.user.id,
  });

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.STICKY_CREATED,
    title: "Sticky Created",
    actorId: interaction.user.id,
    fields: [
      {
        name: "Channel",
        value: `${channel} \`${channel.id}\``,
      },
      {
        name: "Title",
        value: title,
      },
      {
        name: "Color",
        value: `\`0x${color.toString(16).padStart(6, "0")}\``,
        inline: true,
      },
      {
        name: "Message ID",
        value: `\`${sticky.messageId}\``,
        inline: true,
      },
    ],
  });

  return interaction.reply({
    content: `✅ Sticky created in ${channel}.`,
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}

async function deleteSticky(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId || !interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.STICKY_MANAGE);

  const channel = interaction.options.getChannel("channel", true) as TextChannel;

  const sticky = await StickyService.deleteByChannel(
    interaction.guildId,
    channel.id
  );

  if (!sticky) {
    return interaction.reply({
      content: `No active sticky exists in ${channel}.`,
      ephemeral: true,
      allowedMentions: {
        parse: [],
      },
    });
  }

  const oldMessage = await channel.messages
    .fetch(sticky.messageId)
    .catch(() => null);

  if (oldMessage) {
    await oldMessage.delete().catch(() => null);
  }

  await AuditLogService.log(interaction.guild, {
    tag: AUDIT_TAGS.STICKY_DELETED,
    title: "Sticky Deleted",
    actorId: interaction.user.id,
    fields: [
      {
        name: "Channel",
        value: `${channel} \`${channel.id}\``,
      },
      {
        name: "Title",
        value: sticky.title,
      },
    ],
  });

  return interaction.reply({
    content: `✅ Sticky deleted from ${channel}.`,
    ephemeral: true,
    allowedMentions: {
      parse: [],
    },
  });
}

async function listStickies(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.STICKY_MANAGE);

  const stickies = await StickyService.list(interaction.guildId);

  if (stickies.length === 0) {
    return interaction.reply({
      content: "No sticky embeds exist in this server.",
      ephemeral: true,
    });
  }

  let page = 0;
  const totalPages = Math.ceil(stickies.length / PAGE_SIZE);

  const buildContent = () => {
    const pageStickies = stickies.slice(
      page * PAGE_SIZE,
      (page + 1) * PAGE_SIZE
    );

    const lines = pageStickies.map((sticky, index) => {
      const number = page * PAGE_SIZE + index + 1;

      return (
        `**${number}.** <#${sticky.channelId}>\n` +
        `Title: \`${sticky.title}\`\n` +
        `Message ID: \`${sticky.messageId}\``
      );
    });

    return (
      `📌 **Sticky Embeds**\n` +
      `Page **${page + 1}/${totalPages}**\n\n` +
      lines.join("\n\n")
    );
  };

  const buildButtons = () =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("sticky_list_prev")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("sticky_list_next")
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

    if (buttonInteraction.customId === "sticky_list_prev") {
      page = Math.max(0, page - 1);
    }

    if (buttonInteraction.customId === "sticky_list_next") {
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