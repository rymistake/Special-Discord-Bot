import { PERMISSIONS, PermissionKey, ALL_PERMISSIONS } from "./permissions.js";

export type PermissionPreset = {
  name: string;
  value: string;
  requiredManageLevel: number;
  permissions: PermissionKey[];
};

export const PERMISSION_PRESETS: Record<string, PermissionPreset> = {
  junior_moderator: {
    name: "Junior Moderator",
    value: "junior_moderator",
    requiredManageLevel: 1,
    permissions: [
      PERMISSIONS.MODERATION_WARN,
      PERMISSIONS.MODERATION_PURGE,
      PERMISSIONS.MODERATION_MUTE,
      PERMISSIONS.TICKET_CLOSE,
    ],
  },

  moderator: {
    name: "Moderator",
    value: "moderator",
    requiredManageLevel: 1,
    permissions: [
      PERMISSIONS.MODERATION_WARN,
      PERMISSIONS.MODERATION_MUTE,
      PERMISSIONS.MODERATION_PURGE,
      PERMISSIONS.MODERATION_KICK,
      PERMISSIONS.MODERATION_BAN,
      PERMISSIONS.TICKET_CLOSE,
    ],
  },

  senior_moderator: {
    name: "Senior Moderator",
    value: "senior_moderator",
    requiredManageLevel: 1,
    permissions: [
      PERMISSIONS.MODERATION_WARN,
      PERMISSIONS.MODERATION_MUTE,
      PERMISSIONS.MODERATION_PURGE,
      PERMISSIONS.MODERATION_KICK,
      PERMISSIONS.MODERATION_BAN,
      PERMISSIONS.TICKET_CLOSE,
      PERMISSIONS.VERIFICATION_UPDATE_USER,
    ],
  },

  ticket_manager: {
    name: "Ticket Manager",
    value: "ticket_manager",
    requiredManageLevel: 2,
    permissions: [
      PERMISSIONS.TICKET_CONFIG,
      PERMISSIONS.TICKET_CLOSE,
      PERMISSIONS.TICKET_MANAGE_USERS,
      PERMISSIONS.TICKET_TRANSCRIPT,
    ],
  },

  role_sync_manager: {
    name: "Role Sync Manager",
    value: "role_sync_manager",
    requiredManageLevel: 2,
    permissions: [
      PERMISSIONS.VERIFICATION_UPDATE_USER,
      PERMISSIONS.VERIFICATION_UPDATE_ROLE,
      PERMISSIONS.ROLEBIND_MANAGE,
    ],
  },

  department_command: {
    name: "Department Command",
    value: "department_command",
    requiredManageLevel: 2,
    permissions: [
      PERMISSIONS.TICKET_CLOSE,
      PERMISSIONS.MODERATION_WARN,
      PERMISSIONS.MODERATION_MUTE,
      PERMISSIONS.MODERATION_PURGE,
      PERMISSIONS.MODERATION_KICK,
      PERMISSIONS.MODERATION_BAN,
      PERMISSIONS.VERIFICATION_UPDATE_USER,
    ],
  },

  department_head: {
    name: "Department Head",
    value: "department_head",
    requiredManageLevel: 2,
    permissions: [
      PERMISSIONS.AUDIT_MANAGE,
      PERMISSIONS.TICKET_CONFIG,
      PERMISSIONS.TICKET_CLOSE,
      PERMISSIONS.TICKET_MANAGE_USERS,
      PERMISSIONS.TICKET_TRANSCRIPT,
      PERMISSIONS.VERIFICATION_UPDATE_USER,
      PERMISSIONS.VERIFICATION_UPDATE_ROLE,
      PERMISSIONS.ROLEBIND_MANAGE,
      PERMISSIONS.PERMISSION_MANAGE_LEVEL_1,
      PERMISSIONS.PERMISSION_MANAGE_LEVEL_2,
    ],
  },

  game_manager: {
    name: "Game Manager",
    value: "game_manager",
    requiredManageLevel: 3,
    permissions: [
      PERMISSIONS.PERMISSION_MANAGE_LEVEL_1,
      PERMISSIONS.PERMISSION_MANAGE_LEVEL_2,
      PERMISSIONS.PERMISSION_MANAGE_LEVEL_3,
    ],
  },

  administrator: {
    name: "Administrator",
    value: "administrator",
    requiredManageLevel: 4,
    permissions: ALL_PERMISSIONS.filter(
      permission => permission !== PERMISSIONS.PERMISSION_MANAGE_LEVEL_4
    ),
  },
};

export const PRESET_CHOICES = Object.values(PERMISSION_PRESETS).map(preset => ({
  name: preset.name,
  value: preset.value,
}));