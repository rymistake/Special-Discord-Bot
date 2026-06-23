import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";

import { PermissionService } from "../../services/PermissionService.js";
import { IsolationService } from "../../services/IsolationService.js";
import { PERMISSIONS } from "../../config/permissions.js";

export const data = new SlashCommandBuilder()
  .setName("gulag")
  .setDescription("Send or release a user to/from Gulag.")
  .addSubcommand(sub =>
    sub
      .setName("send")
      .setDescription("Send a user to the Gulag.")
      .addUserOption(opt =>
        opt.setName("user").setDescription("User to send.").setRequired(true)
      )
      .addIntegerOption(opt =>
        opt
          .setName("goal")
          .setDescription("Coal goal.")
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("release")
      .setDescription("Release a user from the Gulag.")
      .addUserOption(opt =>
        opt.setName("user").setDescription("User to release.").setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  await PermissionService.require(interaction, PERMISSIONS.JAIL_MANAGE);

  const subcommand = interaction.options.getSubcommand();

  const actor = await interaction.guild.members.fetch(interaction.user.id);

  console.log(`Interaction received: /${interaction.commandName}`);

  if (subcommand === "send") {
    console.log("Entered jail command");
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser("user", true);
    const goal = interaction.options.getInteger("goal", true);

    const target = await interaction.guild.members.fetch(user.id);

    try {
        try {
            await IsolationService.isolate({
                actor,
                target,
                goal,
            });
        } catch (error) {
            console.error("Error isolating member:", error);
        }


      return interaction.editReply({
        content: `✅ Sent ${user} to the Gulag. Goal: **${goal} coal**.`,
        allowedMentions: {
          parse: [],
        },
      });
    } catch (error) {
      return interaction.editReply({
        content:
          error instanceof Error
            ? `⚠️ ${error.message}`
            : "⚠️ Could not send the user to the Gulag.",
      });
    }
  }

  if (subcommand === "release") {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser("user", true);
    const target = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!target) {
      return interaction.editReply({
        content: "That user is not in this server.",
      });
    }

    const released = await IsolationService.releaseMember(target as GuildMember, {
        releasedBy: interaction.user.id,
        completedGoal: false,
    });

    if (!released) {
      return interaction.editReply({
        content: "That user is not in Gulag.",
      });
    }

    return interaction.editReply({
      content: `✅ Released ${user} from the Gulag.`,
      allowedMentions: {
        parse: [],
      },
    });
  }
}
