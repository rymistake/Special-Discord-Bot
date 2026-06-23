import {
  Client,
  Events,
  TextChannel,
} from "discord.js";

import { StickyService } from "../services/StickyService.js";

const stickyRefreshLocks = new Set<string>();

export function startStickyRefreshJob(client: Client) {
  client.on(Events.MessageCreate, async message => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!(message.channel instanceof TextChannel)) return;

    const channel = message.channel;
    const channelId = channel.id;

    if (stickyRefreshLocks.has(channelId)) return;

    stickyRefreshLocks.add(channelId);

    setTimeout(async () => {
      try {
        await StickyService.refresh(channel);
      } catch (error) {
        console.error("Failed to refresh sticky:", error);
      } finally {
        stickyRefreshLocks.delete(channelId);
      }
    }, 3000);
  });

  console.log("Sticky refresh job started.");
}