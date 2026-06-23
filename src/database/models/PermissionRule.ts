import mongoose, { Schema } from "mongoose";

const permissionRuleSchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },

    permissionKey: {
      type: String,
      required: true,
      index: true,
    },

    roleIds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

permissionRuleSchema.index({ guildId: 1, permissionKey: 1 }, { unique: true });

export const PermissionRuleModel = mongoose.model(
  "PermissionRule",
  permissionRuleSchema
);