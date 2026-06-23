import mongoose, { Schema } from "mongoose";

const isolationSchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    isolatedBy: {
      type: String,
      required: true,
    },

    originalRoleIds: {
      type: [String],
      default: [],
    },

    goal: {
      type: Number,
      required: true,
      min: 1,
    },

    coal: {
      type: Number,
      default: 0,
      min: 0,
    },

    isolationChannelId: {
      type: String,
      required: true,
    },

    isolationRoleId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

isolationSchema.index(
  { guildId: 1, userId: 1 },
  { unique: true }
);

export const IsolationModel = mongoose.model("Isolation", isolationSchema);