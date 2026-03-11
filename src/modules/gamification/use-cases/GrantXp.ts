import { XpReason } from "../../../../generated/prisma/enums.js";
import { PrismaClient, PrismaTransaction } from "../../../lib/db.js";
import { calculateLevel } from "../../../lib/gamification.js";
import { createAndEmitNotification } from "../../../lib/notifications.js";

interface InputDto {
  userId: string;
  amount: number;
  reason: XpReason;
  relatedId?: string;
}

export class GrantXp {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto, tx?: PrismaTransaction): Promise<void> {
    const client = tx || this.prisma;

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
      // In case of GrantXp, we might not have a transaction, so we use prisma or the passed tx.
      // But createAndEmitNotification requires a PrismaTransaction.
      // Actually, PrismaClient and PrismaTransaction are almost the same for .notification.create.
      // Let's cast client as PrismaTransaction since it's used only for operations supported by both.
      await createAndEmitNotification(
        {
          recipientId: dto.userId,
          type: "LEVEL_UP",
        },
        client as PrismaTransaction,
      );
    }
  }
}
