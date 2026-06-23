import mongoose, { Schema } from "mongoose";

const stickySchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },

    channelId: {
      type: String,
      required: true,
      index: true,
    },

    messageId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 256,
    },

    description: {
      type: String,
      required: true,
      maxlength: 4000,
    },

    color: {
      type: Number,
      default: 0x0f0f0f,
    },

    createdBy: {
      type: String,
      required: true,
    },

    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

stickySchema.index(
  { guildId: 1, channelId: 1, enabled: 1 },
  { unique: true, partialFilterExpression: { enabled: true } }
);

export const StickyModel = mongoose.model("Sticky", stickySchema);