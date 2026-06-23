import {
  EmbedBuilder,
  TextChannel,
} from "discord.js";

import { StickyModel } from "../database/models/Sticky.js";

export class StickyService {
  static buildEmbed(data: {
    title: string;
    description: string;
    color?: number;
  }) {
    return new EmbedBuilder()
      .setColor(data.color ?? 0x0f0f0f)
      .setTitle(data.title)
      .setDescription(data.description);
  }

  static async create(data: {
    guildId: string;
    channel: TextChannel;
    title: string;
    description: string;
    color?: number;
    createdBy: string;
  }) {
    await this.deleteByChannel(data.guildId, data.channel.id);

    const message = await data.channel.send({
      embeds: [
        this.buildEmbed({
          title: data.title,
          description: data.description,
          color: data.color,
        }),
      ],
    });

    return StickyModel.create({
      guildId: data.guildId,
      channelId: data.channel.id,
      messageId: message.id,
      title: data.title,
      description: data.description,
      color: data.color ?? 0x0f0f0f,
      createdBy: data.createdBy,
      enabled: true,
    });
  }

  static async list(guildId: string) {
    return StickyModel.find({
      guildId,
      enabled: true,
    }).sort({ createdAt: -1 });
  }

  static async getByChannel(guildId: string, channelId: string) {
    return StickyModel.findOne({
      guildId,
      channelId,
      enabled: true,
    });
  }

  static async deleteByChannel(guildId: string, channelId: string) {
    const sticky = await this.getByChannel(guildId, channelId);

    if (!sticky) return null;

    sticky.enabled = false;
    await sticky.save();

    return sticky;
  }

  static async refresh(channel: TextChannel) {
    const sticky = await this.getByChannel(channel.guild.id, channel.id);

    if (!sticky) return null;

    const oldMessage = await channel.messages
      .fetch(sticky.messageId)
      .catch(() => null);

    if (oldMessage) {
      await oldMessage.delete().catch(() => null);
    }

    const newMessage = await channel.send({
      embeds: [
        this.buildEmbed({
          title: sticky.title,
          description: sticky.description,
          color: sticky.color,
        }),
      ],
    });

    sticky.messageId = newMessage.id;
    await sticky.save();

    return sticky;
  }
}