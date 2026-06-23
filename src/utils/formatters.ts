export function formatRoleList(roleIds: string[]) {
  return roleIds.length
    ? roleIds.map(id => `<@&${id}>`).join(", ")
    : "None";
}

export function formatTicketChannelName(username: string) {
  const safeUsername = username
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `ticket-${safeUsername || "user"}`;
}