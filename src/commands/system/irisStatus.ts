import {
  ActivityType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { SystemOperatorService } from "../../services/SystemOperatorService.js";

export const data = new SlashCommandBuilder()
  .setName("iris-status")
  .setDescription("Set IRiS' status message.")
  .addStringOption(option =>
    option
      .setName("description")
      .setDescription("The status text.")
      .setRequired(true)
      .setMaxLength(128)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const isSystemOperator = await SystemOperatorService.isSystemOperator(
    interaction.user.id
  );

  if (!isSystemOperator) {
    return interaction.reply({
      content: "Only System Operators can use this command.",
      ephemeral: true,
    });
  }

  const description = interaction.options.getString("description", true);

  interaction.client.user?.setPresence({
    activities: [
      {
        name: description,
        type: ActivityType.Custom,
      },
    ],
    status: "online",
  });

  return interaction.reply({
    content: `✅ IRiS status set to: \`${description}\``,
    ephemeral: true,
  });
}