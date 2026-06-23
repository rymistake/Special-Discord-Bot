import { GuildMember, PermissionFlagsBits } from "discord.js";

export function hasAdministrator(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

export function canManageRoles(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageRoles);
}

export function canManageMessages(member: GuildMember) {
  return member.permissions.has(PermissionFlagsBits.ManageMessages);
}

export function hasAnyRole(member: GuildMember, roleIds: string[]) {
  return roleIds.some(roleId => member.roles.cache.has(roleId));
}