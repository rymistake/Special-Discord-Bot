import { GuildConfigModel } from "../database/models/GuildConfig.js";

export class GuildConfigService {
    static async get(guildId: string) {
        return GuildConfigModel.findOne({ guildId, registered: true });
    }

    static async register(guildId: string, departmentKey: string) {
    const existingDepartment = await GuildConfigModel.findOne({
        departmentKey,
        registered: true,
        guildId: { $ne: guildId },
    });

    if (existingDepartment) {
        throw new Error(
        `Department "${departmentKey}" is already registered to another server.`
        );
    }

    return GuildConfigModel.findOneAndUpdate(
        { guildId },
        {
        guildId,
        departmentKey,
        registered: true,
        },
        {
        upsert: true,
        new: true,
        }
    );
    }

    static async unregister(guildId: string) {
        return GuildConfigModel.findOneAndUpdate(
        { guildId },
        { registered: false },
        { new: true }
        );
    }

    static async isRegistered(guildId: string) {
        const config = await this.get(guildId);
        return Boolean(config);
    }

    static async setAuditChannel(guildId: string, channelId: string) {
        return GuildConfigModel.findOneAndUpdate(
        {
            guildId,
            registered: true,
        },
        {
            auditLogChannelId: channelId,
        },
        {
            new: true,
        }
        );
    }

    static async setTicketCategory(guildId: string, categoryId: string) {
        return GuildConfigModel.findOneAndUpdate(
            {
            guildId,
            registered: true,
            },
            {
            ticketCategoryId: categoryId,
            },
            {
            new: true,
            }
        );
    }

    static async getByDepartment(departmentKey: string) {
    return GuildConfigModel.findOne({
        departmentKey,
        registered: true,
    });
    }

    static async incrementTicketCounter(guildId: string) {
        return GuildConfigModel.findOneAndUpdate(
            {
            guildId,
            registered: true,
            },
            {
            $inc: {
                ticketCounter: 1,
            },
            },
            {
            new: true,
            }
        );
    }

    static async setTicketPanel(
        guildId: string,
        channelId: string,
        messageId: string
        ) {
        return GuildConfigModel.findOneAndUpdate(
            {
            guildId,
            registered: true,
            },
            {
            ticketPanelChannelId: channelId,
            ticketPanelMessageId: messageId,
            },
            {
            new: true,
            }
        );
    }

    static async setVerifiedRole(guildId: string, roleId: string) {
        return GuildConfigModel.findOneAndUpdate(
            {
            guildId,
            registered: true,
            },
            {
            verifiedRoleId: roleId,
            },
            {
            new: true,
            }
        );
    }

    static async setIsolationConfig(
        guildId: string,
        data: {
            isolationChannelId?: string;
            isolationRoleId?: string;
        }
        ) {
        return GuildConfigModel.findOneAndUpdate(
            {
            guildId,
            registered: true,
            },
            data,
            {
            new: true,
            }
        );
    }
}