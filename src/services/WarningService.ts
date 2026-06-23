import { WarningModel } from "../database/models/Warning.js";

export class WarningService {
  static async issue(data: {
    guildId: string;
    targetId: string;
    actorId: string;
    reason: string;
  }) {
    return WarningModel.create(data);
  }

  static async list(guildId: string, targetId: string) {
    return WarningModel.find({
      guildId,
      targetId,
    }).sort({ createdAt: -1 });
  }

  static async revoke(data: {
    guildId: string;
    warningId: string;
  }) {
    return WarningModel.findOneAndDelete({
      _id: data.warningId,
      guildId: data.guildId,
    });
  }
}