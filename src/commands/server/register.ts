import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { DEPARTMENTS, getDepartmentName } from "../../config/departments.js";
import { GuildConfigService } from "../../services/GuildConfigService.js";
import { SystemOperatorService } from "../../services/SystemOperatorService.js";
import { AuditLogService } from "../../services/AuditLogService.js";
import { AUDIT_TAGS } from "../../config/auditTags.js";

export const data = new SlashCommandBuilder()
  .setName("server-register")
  .setDescription("Register this server as a department server.")
  .addStringOption(option =>
    option
      .setName("department")
      .setDescription("The department this server represents.")
      .setRequired(true)
      .addChoices(
        ...DEPARTMENTS.map(dept => ({
          name: dept.name,
          value: dept.key,
        }))
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) {
    return interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  const isOperator = await SystemOperatorService.isSystemOperator(
    interaction.user.id
  );

  if (!isOperator) {
    return interaction.reply({
      content: "Only System Operators can register servers.",
      ephemeral: true,
    });
  }

  const departmentKey = interaction.options.getString("department", true);

  await GuildConfigService.register(interaction.guildId, departmentKey);

  await AuditLogService.log(interaction.guild!, {
    tag: AUDIT_TAGS.SERVER_REGISTERED,
    title: "Server Registered",
    description: `Server registered as **${getDepartmentName(departmentKey)}**.`,
    actorId: interaction.user.id,
  });

  return interaction.reply({
    content: `✅ Server registered as **${getDepartmentName(departmentKey)}**.`,
    ephemeral: true,
  });
}