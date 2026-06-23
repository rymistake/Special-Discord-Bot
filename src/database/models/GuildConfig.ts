import mongoose, { Schema } from "mongoose";

const guildConfigSchema = new Schema(
  {
    guildId: {
        type: String,
        required: true,
        unique: true,
    },

    departmentKey: {
        type: String,
        required: true,
    },

    ticketCounter: {
        type: Number,
        default: 0,
    },

    registered: {
        type: Boolean,
        default: true,
    },

    auditLogChannelId: {
        type: String,
        default: null,
    },

    ticketCategoryId: {
        type: String,
        default: null,
    },

    verifiedRoleId: {
        type: String,
        default: null,
    },

    isolationChannelId: {
        type: String,
        default: null,
    },

    isolationRoleId: {
        type: String,
        default: null,
    },
  },
  { timestamps: true }
);

guildConfigSchema.index(
    { departmentKey: 1 },
    {
        unique: true,
        partialFilterExpression: { registered: true },
    }
);

export const GuildConfigModel = mongoose.model(
    "GuildConfig",
    guildConfigSchema
);