import { EmbedBuilder } from "discord.js";
import { COLORS } from "./constants.js";

export function successEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(description)
    .setTimestamp();
}

export function errorEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setDescription(description)
    .setTimestamp();
}

export function warningEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.WARNING)
    .setDescription(description)
    .setTimestamp();
}

export function infoEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setDescription(description)
    .setTimestamp();
}