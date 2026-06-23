import mongoose, { Schema } from "mongoose";

const systemOperatorSchema = new Schema(
  {
    discordId: {
      type: String,
      required: true,
      unique: true,
    },

    level: {
      type: String,
      enum: ["developer", "manager"],
      default: "manager",
      required: true,
    },
  },
  { timestamps: true }
);

export const SystemOperatorModel = mongoose.model(
  "SystemOperator",
  systemOperatorSchema
);