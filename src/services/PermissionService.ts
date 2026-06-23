import {
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

import { PermissionRuleModel } from "../database/models/PermissionRule.js";
import { SystemOperatorService } from "./SystemOperatorService.js";
import { PermissionError } from "../utils/errors.js";
import { PermissionKey } from "../config/permissions.js";

export class PermissionService {
  static async isAllowed(member: GuildMember, permissionKey: string) {
    const isOperator = await SystemOperatorService.isSystemOperator(member.id);

    if (isOperator) {
      return true;
    }

    const rule = await PermissionRuleModel.findOne({
      guildId: member.guild.id,
      permissionKey,
    });

    if (!rule) {
      return false;
    }

    return rule.roleIds.some(roleId => member.roles.cache.has(roleId));
  }

  static async require(
    interaction: ChatInputCommandInteraction,
    permissionKey: string
  ) {
    if (!interaction.guild || !interaction.member) {
      throw new PermissionError("This command can only be used in a server.");
    }

    const member = interaction.member as GuildMember;

    const allowed = await this.isAllowed(member, permissionKey);

    if (!allowed) {
      throw new PermissionError();
    }
  }

  static async grant(guildId: string, permissionKey: string, roleId: string) {
    return PermissionRuleModel.findOneAndUpdate(
      {
        guildId,
        permissionKey,
      },
      {
        $addToSet: {
          roleIds: roleId,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  static async revoke(guildId: string, permissionKey: string, roleId: string) {
    return PermissionRuleModel.findOneAndUpdate(
      {
        guildId,
        permissionKey,
      },
      {
        $pull: {
          roleIds: roleId,
        },
      },
      {
        new: true,
      }
    );
  }

  static async list(guildId: string) {
    return PermissionRuleModel.find({ guildId }).sort({ permissionKey: 1 });
  }

  static async getRule(guildId: string, permissionKey: string) {
    return PermissionRuleModel.findOne({ guildId, permissionKey });
  }

  static async getPermissionsForMember(member: GuildMember): Promise<PermissionKey[]> {
    const roleIds = member.roles.cache.map(role => role.id);

    const entries = await PermissionRuleModel.find({
      guildId: member.guild.id,
      roleIds: {
        $in: roleIds,
      },
    });

    return entries.map(entry => entry.permissionKey as PermissionKey);
  }

  static async requireAny(
    interaction: ChatInputCommandInteraction,
    permissionKeys: PermissionKey[]
  ) {
    if (!interaction.guild || !interaction.member) {
      throw new PermissionError("This command can only be used in a server.");
    }

    const member = interaction.member as GuildMember;

    const isOperator = await SystemOperatorService.isSystemOperator(member.id);

    if (isOperator) {
      return;
    }

    const permissions = await this.getPermissionsForMember(member);

    const allowed = permissionKeys.some(permissionKey =>
      permissions.includes(permissionKey)
    );

    if (!allowed) {
      throw new PermissionError();
    }
  }
}