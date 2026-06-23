export const PERMISSIONS = {
  AUDIT_MANAGE: "audit.manage",

  TICKET_CONFIG: "ticket.config",
  TICKET_CLOSE: "ticket.close",
  TICKET_MANAGE_USERS: "ticket.manage-users",
  TICKET_TRANSCRIPT: "ticket.transcript",

  VERIFICATION_UPDATE_USER: "verification.update.user", // /force-update command
  VERIFICATION_UPDATE_ROLE: "verification.update.role", // /mass-update command

  ROLEBIND_MANAGE: "rolebind.manage", // All role binding commands

  PERMISSION_MANAGE_LEVEL_1: "permission.manage.level1", // Moderation commands 
  PERMISSION_MANAGE_LEVEL_2: "permission.manage.level2", // Config commands
  PERMISSION_MANAGE_LEVEL_3: "permission.manage.level3", // Game interacting commands (e.g. /blacklist)
  PERMISSION_MANAGE_LEVEL_4: "permission.manage.level4", // All permission management commands

  MODERATION_WARN: "moderation.warn",
  MODERATION_MUTE: "moderation.mute",
  MODERATION_BAN: "moderation.ban",
  MODERATION_KICK: "moderation.kick",
  MODERATION_PURGE: "moderation.purge",

  STICKY_MANAGE: "sticky.manage",

  JAIL_MANAGE: "jail.manage",
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const PERMISSION_LEVELS: Record<PermissionKey, number> = {
  [PERMISSIONS.MODERATION_WARN]: 1,
  [PERMISSIONS.MODERATION_MUTE]: 1,
  [PERMISSIONS.MODERATION_BAN]: 1,
  [PERMISSIONS.MODERATION_KICK]: 1,
  [PERMISSIONS.MODERATION_PURGE]: 1,

  [PERMISSIONS.AUDIT_MANAGE]: 2,
  [PERMISSIONS.TICKET_CONFIG]: 2,
  [PERMISSIONS.TICKET_CLOSE]: 2,
  [PERMISSIONS.TICKET_MANAGE_USERS]: 2,
  [PERMISSIONS.TICKET_TRANSCRIPT]: 2,
  [PERMISSIONS.VERIFICATION_UPDATE_USER]: 2,
  [PERMISSIONS.VERIFICATION_UPDATE_ROLE]: 2,
  [PERMISSIONS.ROLEBIND_MANAGE]: 2,

  [PERMISSIONS.PERMISSION_MANAGE_LEVEL_1]: 2,
  [PERMISSIONS.PERMISSION_MANAGE_LEVEL_2]: 2,
  [PERMISSIONS.PERMISSION_MANAGE_LEVEL_3]: 3,
  [PERMISSIONS.PERMISSION_MANAGE_LEVEL_4]: 4,

  [PERMISSIONS.STICKY_MANAGE]: 2,

  [PERMISSIONS.JAIL_MANAGE]: 1,
};

export function getPermissionLevel(permission: PermissionKey) {
  return PERMISSION_LEVELS[permission] ?? 4;
}

export function getManageLevelFromPermissions(permissions: PermissionKey[]) {
  if (permissions.includes(PERMISSIONS.PERMISSION_MANAGE_LEVEL_4)) return 4;
  if (permissions.includes(PERMISSIONS.PERMISSION_MANAGE_LEVEL_3)) return 3;
  if (permissions.includes(PERMISSIONS.PERMISSION_MANAGE_LEVEL_2)) return 2;
  if (permissions.includes(PERMISSIONS.PERMISSION_MANAGE_LEVEL_1)) return 1;

  return 0;
}