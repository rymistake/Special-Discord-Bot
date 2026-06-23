import { TempBanModel } from "../database/models/TempBan.js";

export class TempBanService {
  static async create(data: {
    guildId: string;
    targetId: string;
    actorId: string;
    reason: string;
    expiresAt: Date;
  }) {
    return TempBanModel.create({
      ...data,
      active: true,
    });
  }

  static async getExpired() {
    return TempBanModel.find({
      active: true,
      expiresAt: {
        $lte: new Date(),
      },
    }).limit(25);
  }

  static async markCompleted(id: string) {
    return TempBanModel.findByIdAndUpdate(id, {
      active: false,
      completedAt: new Date(),
    });
  }

  static async deactivateForUser(guildId: string, targetId: string) {
    return TempBanModel.updateMany(
      {
        guildId,
        targetId,
        active: true,
      },
      {
        active: false,
        completedAt: new Date(),
      }
    );
  }
}