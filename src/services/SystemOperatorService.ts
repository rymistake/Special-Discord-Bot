import { SystemOperatorModel } from "../database/models/SystemOperator.js";

export class SystemOperatorService {
  static async isSystemOperator(discordId: string) {
    const operator = await SystemOperatorModel.findOne({ discordId });
    return Boolean(operator);
  }

  static async get(discordId: string) {
    return SystemOperatorModel.findOne({ discordId });
  }
}