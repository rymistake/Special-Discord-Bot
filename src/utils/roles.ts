import { Guild } from "discord.js";

export function parseRoleIds(input: string | null) {
  if (!input) return [];

  return input
    .split(",")
    .map(value => value.trim())
    .map(value => value.replace(/[<@&>]/g, ""))
    .filter(Boolean);
}

export function validateRoleIds(guild: Guild, roleIds: string[]) {
  const invalid = roleIds.find(roleId => !guild.roles.cache.has(roleId));

  if (invalid) {
    throw new Error(`Invalid role ID: ${invalid}`);
  }
}