import { Schema } from "mongoose";
import { moderationConnection } from "../moderationMongo.js";

const tempBanSchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },

    targetId: {
      type: String,
      required: true,
      index: true,
    },

    actorId: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

tempBanSchema.index({
  guildId: 1,
  targetId: 1,
  active: 1,
});

export const TempBanModel = moderationConnection.model(
  "TempBan",
  tempBanSchema,
  "tempbans"
);