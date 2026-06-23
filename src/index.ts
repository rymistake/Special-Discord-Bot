import {
  Client,
  GatewayIntentBits,
  Collection,
  Partials
} from "discord.js";

import dotenv from "dotenv";
import { loadCommands } from "./utils/loadCommands.js";
import { registerCommands } from "./utils/registerCommands.js";
import { connectMongo } from "./database/mongo.js";
import { connectModerationMongo } from "./database/moderationMongo.js";
import { startTempBanExpiryJob } from "./jobs/TempBanExpiryJob.js";
import { startStickyRefreshJob } from "./jobs/StickyRefreshJob.js";
import { PermissionError } from "./utils/errors.js";
import { AI_CHAT_CONFIG } from "./config/aiChat.js";
import { OpenAIChatService } from "./services/OpenAIChatService.js";
import { AIContextService } from "./services/AIContextService.js";
// Delete later on
import { IsolationService } from "./services/IsolationService.js";
import { SystemOperatorService } from "./services/SystemOperatorService.js";
// End delete

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
}) as Client & { commands: Collection<string, any> };

client.commands = new Collection();

async function start() {
  // 1. Connect DB FIRST
  await connectMongo();
  await connectModerationMongo();

  // 2. Login Discord AFTER DB is ready
  await client.login(process.env.DISCORD_TOKEN);
}

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  startTempBanExpiryJob(client);
  startStickyRefreshJob(client);

  const commands = await loadCommands();

  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }

  await registerCommands(client, commands);
});

client.on("messageCreate", async message => {
  try {
    if (message.guild && !message.author.bot) {
      const isSystemOperator = await SystemOperatorService.isSystemOperator(
        message.author.id
      );

      if (!isSystemOperator) {
        const isolated = await IsolationService.isIsolated(
          message.guild.id,
          message.author.id
        );

        if (isolated) return;
      }
    }

    if (
      message.guild &&
      AI_CHAT_CONFIG.enabledGuildIds.includes(message.guild.id) &&
      message.mentions.has(client.user!) &&
      !message.author.bot
    ) {
      const prompt = message.content
        .replace(`<@${client.user!.id}>`, "")
        .replace(`<@!${client.user!.id}>`, "")
        .trim()
        .slice(0, AI_CHAT_CONFIG.maxPromptLength);

      if (!prompt) {
        await message.reply("How can I help?");
        return;
      }

      await message.channel.sendTyping();

      const context = await AIContextService.getChannelContext(message);

      const answer = await OpenAIChatService.respond({
        prompt,
        context,
        userID: message.author.id,
      });

      await message.reply({
        content: answer.slice(0, 1900),
        allowedMentions: {
          repliedUser: false,
          parse: [],
        },
      });
    return;
  }
  } catch (error) {
    console.error(error);
  }
})

client.on("interactionCreate", async interaction => {
  try {

    if (!interaction.isChatInputCommand()) return;

    // Gulag /work handler - delete later
    const isSystemOperator = await SystemOperatorService.isSystemOperator(
      interaction.user.id
    );

    if (
      interaction.isChatInputCommand() &&
      interaction.guildId &&
      interaction.commandName !== "work" &&
      !isSystemOperator
    ) {
      const isolated = await IsolationService.isIsolated(
        interaction.guildId,
        interaction.user.id
      );

      if (isolated) {
        return interaction.reply({
          content: "⛏️ You are isolated. You can only use `/work`.",
          ephemeral: true,
        });
      }
    }

    // End delete

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`No command found for ${interaction.commandName}`);

      return interaction.reply({
        content: "Command not found.",
        ephemeral: true,
      });
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      if (err instanceof PermissionError) {
        const msg = {
          content: "⚠️ You do not have permission to use this command.",
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg).catch(() => null);
        } else {
          await interaction.reply(msg).catch(() => null);
        }

        return;
      }

      console.error(err);

      const msg = {
        content: "Command failed.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => null);
      } else {
        await interaction.reply(msg).catch(() => null);
      }
    }
  } catch (err) {
    console.error(err);

    try {
      if (interaction.isRepliable()) {
        const msg = { content: "Interaction failed.", ephemeral: true };

        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(msg).catch(() => null);
        } else {
          await interaction.reply(msg).catch(() => null);
        }
      }
    } catch {
      // Ignore expired interaction reply errors
  }
  }
});

start();
