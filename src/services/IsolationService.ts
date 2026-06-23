import {
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

import { IsolationModel } from "../database/models/Isolation.js";
import { GuildConfigService } from "./GuildConfigService.js";

export class IsolationService {
  static async isIsolated(guildId: string, userId: string) {
    const isolation = await IsolationModel.findOne({ guildId, userId });
    return Boolean(isolation);
  }

  static async get(guildId: string, userId: string) {
    return IsolationModel.findOne({ guildId, userId });
  }

  private static buildIsolationEmbed(data: {
    targetId: string;
    goal: number;
    isolatedBy: string;
    }) {
    return new EmbedBuilder()
        .setColor(0x0f0f0f)
        .setTitle("⛓️ Welcome to the Gulag ⛓️")
        .setDescription(
        `Hello, <@${data.targetId}>.\n\n` +
        `You have been sent to the Gulag for your crimes against the server. You will undergo the 'server rehabilitation program.' Good luck, prove yourself to the motherland and earn your freedom back.\n\n` +
        `You must gather **${data.goal} coal** to be released. Glory to the motherland!`
        )
        .addFields(
        {
            name: "Progress",
            value: `**0/${data.goal}** coal gathered`,
            inline: true,
        },
        {
            name: "Earn your freedom",
            value: "Use `/work` to earn 1x coal",
            inline: true,
        }
        );
    }

    private static buildReleaseEmbed(data: {
        targetId: string;
        coal: number;
        goal: number;
        releasedBy?: string;
        completedGoal: boolean;
        }) {
        return new EmbedBuilder()
            .setColor(0x0f0f0f)
            .setTitle(`⛏️ ${data.completedGoal ? "Sentence Completed" : "User Released"}`)
            .setDescription(
            data.completedGoal
                ? `<@${data.targetId}> has gathered enough coal and has been released. \n Freedom at last!`
                : `<@${data.targetId}> was released by the warden. \n Freedom at last!`
            )
            .addFields(
            {
                name: "Coal",
                value: `**${data.coal}/${data.goal}**`,
                inline: true,
            },
            ...(data.releasedBy
                ? [
                    {
                    name: "Released By",
                    value: `<@${data.releasedBy}>`,
                    inline: true,
                    },
                ]
                : [])
            );
        }

  static async isolate(data: {
    actor: GuildMember;
    target: GuildMember;
    goal: number;
  }) {
    const { actor, target, goal } = data;
    const guild = actor.guild;

    const config = await GuildConfigService.get(guild.id);

    if (!config?.isolationChannelId || !config?.isolationRoleId) {
      throw new Error("Gulag channel or role has not been configured.");
    }

    if (
      target.roles.highest.position >= actor.roles.highest.position &&
      actor.id !== guild.ownerId
    ) {
      throw new Error("You cannot send a user with an equal or higher role to Gulag.");
    }

    const existing = await IsolationModel.findOne({
      guildId: guild.id,
      userId: target.id,
    });

    if (existing) {
      throw new Error("This user is already in the Gulag.");
    }

    const isolationRole = await guild.roles.fetch(config.isolationRoleId);

    if (!isolationRole) {
      throw new Error("Gulag role no longer exists.");
    }

    if (!target.manageable) {
      throw new Error("I cannot manage this user.");
    }

    const originalRoleIds = target.roles.cache
      .filter(role => role.id !== guild.id)
      .filter(role => role.id !== isolationRole.id)
      .map(role => role.id);

    await target.roles.set([isolationRole.id]);

    const isolation = await IsolationModel.create({
      guildId: guild.id,
      userId: target.id,
      isolatedBy: actor.id,
      originalRoleIds,
      goal,
      coal: 0,
      isolationChannelId: config.isolationChannelId,
      isolationRoleId: config.isolationRoleId,
    });

    const channel = await guild.channels
      .fetch(config.isolationChannelId)
      .catch(() => null);

    if (channel?.isTextBased()) {
      await (channel as TextChannel).send({
        content: `<@${target.id}>`,
        embeds: [
            this.buildIsolationEmbed({
            targetId: target.id,
            goal,
            isolatedBy: actor.id,
        }),
        ],
        allowedMentions: {
          users: [target.id],
        },
      });
    }

    return isolation;
  }

    static async addCoal(member: GuildMember) {
    const isolation = await IsolationModel.findOne({
        guildId: member.guild.id,
        userId: member.id,
    });

    if (!isolation) {
        throw new Error("You are not in the Gulag");
    }

    isolation.coal += 1;
    await isolation.save();

    if (isolation.coal >= isolation.goal) {
        await this.releaseMember(member, {
        completedGoal: true,
        });

        return {
        completed: true,
        coal: isolation.coal,
        goal: isolation.goal,
        };
    }

    return {
        completed: false,
        coal: isolation.coal,
        goal: isolation.goal,
    };
    }

    static async releaseMember(member: GuildMember, options?: {releasedBy?: string; completedGoal?: boolean; }) {
        const isolation = await IsolationModel.findOne({
            guildId: member.guild.id,
            userId: member.id,
        });

        if (!isolation) return null;

        const validRoles: string[] = [];

        for (const roleId of isolation.originalRoleIds) {
            const role = await member.guild.roles.fetch(roleId).catch(() => null);
            if (role) validRoles.push(roleId);
        }

        await member.roles.set(validRoles).catch(() => null);

        const channel = await member.guild.channels
        .fetch(isolation.isolationChannelId)
        .catch(() => null);

        if (channel?.isTextBased()) {
        await (channel as TextChannel).send({
            content: `<@${member.id}>`,
            embeds: [
            this.buildReleaseEmbed({
                targetId: member.id,
                coal: isolation.coal,
                goal: isolation.goal,
                releasedBy: options?.releasedBy,
                completedGoal: options?.completedGoal ?? false,
            }),
            ],
            allowedMentions: {
            users: [member.id],
            },
        });
        }

        await IsolationModel.deleteOne({
            guildId: member.guild.id,
            userId: member.id,
        });

        return isolation;
    }
}