import { PrismaClient } from "../generated/prisma/client.js";
import { XpReason } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import { calculateLevel } from "../lib/gamification.js";

type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

interface InputDto {
  userId: string;
  amount: number;
  reason: XpReason;
  relatedId?: string;
}

export class GrantXp {
  async execute(dto: InputDto, tx?: PrismaTransaction): Promise<void> {
    const client = tx || prisma;

    if (dto.relatedId) {
      const existing = await client.xpTransaction.findFirst({
        where: {
          userId: dto.userId,
          reason: dto.reason,
          relatedId: dto.relatedId,
        },
      });

      if (existing) return;
    }

    const user = await client.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) return;

    const newTotalXp = user.xp + dto.amount;
    const newLevel = calculateLevel(newTotalXp);

    await client.user.update({
      where: { id: dto.userId },
      data: {
        xp: newTotalXp,
        level: newLevel,
      },
    });

    await client.xpTransaction.create({
      data: {
        userId: dto.userId,
        amount: dto.amount,
        reason: dto.reason,
        relatedId: dto.relatedId,
      },
    });

    if (newLevel > user.level) {
      const notification = await client.notification.create({
        data: {
          recipientId: dto.userId,
          type: "LEVEL_UP",
        },
      });

      const { notificationEvents } = await import("../lib/events.js");
      notificationEvents.emit("new-notification", notification);
    }
  }
}
