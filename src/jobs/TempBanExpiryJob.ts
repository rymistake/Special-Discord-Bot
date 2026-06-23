import { Client } from "discord.js";
import { TempBanService } from "../services/TempBanService.js";
import { AuditLogService } from "../services/AuditLogService.js";
import { AUDIT_TAGS } from "../config/auditTags.js";

let interval: NodeJS.Timeout | null = null;

export function startTempBanExpiryJob(client: Client) {
  if (interval) return;

  interval = setInterval(async () => {
    const expiredBans = await TempBanService.getExpired();

    for (const tempBan of expiredBans) {
      try {
        const guild = await client.guilds.fetch(tempBan.guildId);

        await guild.members.unban(
          tempBan.targetId,
          "Temporary ban expired."
        ).catch(() => null);

        await TempBanService.markCompleted(tempBan._id.toString());

        await AuditLogService.log(guild, {
          tag: AUDIT_TAGS.MODERATION_BAN,
          title: "Temporary Ban Expired",
          targetId: tempBan.targetId,
          fields: [
            {
              name: "Original Reason",
              value: tempBan.reason,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to process expired temp ban:", error);
      }
    }
  }, 60_000);

  console.log("Temp ban expiry job started.");
}