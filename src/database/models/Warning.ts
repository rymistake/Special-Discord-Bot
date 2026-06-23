import { Schema } from "mongoose";
import { moderationConnection } from "../moderationMongo.js";

const warningSchema = new Schema(
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
      index: true,
    },

    reason: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

warningSchema.index({
  guildId: 1,
  targetId: 1,
  active: 1,
});

export const WarningModel = moderationConnection.model(
  "Warning",
  warningSchema,
  "warnings"
);