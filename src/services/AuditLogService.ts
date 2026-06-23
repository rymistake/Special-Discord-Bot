import {
  EmbedBuilder,
  Guild,
  TextBasedChannel,
} from "discord.js";

import { GuildConfigService } from "./GuildConfigService.js";
import { AuditTag, formatAuditTag } from "../config/auditTags.js";
import { COLORS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

type AuditField = {
  name: string;
  value: string;
  inline?: boolean;
};

type AuditLogOptions = {
  tag: AuditTag;
  title: string;
  description?: string;
  actorId?: string;
  targetId?: string;
  fields?: AuditField[];
  files?: string[];
};

export class AuditLogService {
  static async log(guild: Guild, options: AuditLogOptions) {
    const config = await GuildConfigService.get(guild.id);

    if (!config?.auditLogChannelId) {
      Logger.warn(
        `Audit channel missing. Could not log ${formatAuditTag(options.tag)} in guild ${guild.id}.`
      );
      return;
    }

    const channel = await guild.channels
      .fetch(config.auditLogChannelId)
      .catch(() => null);

    if (!channel || !channel.isTextBased()) {
      Logger.warn(
        `Invalid audit channel. Could not log ${formatAuditTag(options.tag)} in guild ${guild.id}.`
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(options.title)
      .setDescription(options.description ?? null)
      .setTimestamp()
      .setFooter({
        text: formatAuditTag(options.tag),
      });

    if (options.actorId) {
      embed.addFields({
        name: "Actor",
        value: `<@${options.actorId}> \`${options.actorId}\``,
        inline: true,
      });
    }

    if (options.targetId) {
      embed.addFields({
        name: "Target",
        value: `<@${options.targetId}> \`${options.targetId}\``,
        inline: true,
      });
    }

    if (options.fields?.length) {
      embed.addFields(options.fields);
    }

    await (channel as any).send({
      content: formatAuditTag(options.tag),
      embeds: [embed],
      files: options.files ?? [],
      allowedMentions: {
        parse: [],
      },
    });
  }
}