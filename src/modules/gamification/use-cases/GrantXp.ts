import { ChallengeGoal, XpReason } from "../../../generated/prisma/enums.js";
import { PrismaClient, PrismaTransaction } from "../../../lib/db.js";
import { calculateLevel } from "../../../lib/gamification.js";
import { createAndEmitNotification } from "../../../lib/notifications.js";
import { UpdateChallengeProgress } from "./UpdateChallengeProgress.js";

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

    const updateChallengeProgress = new UpdateChallengeProgress(this.prisma);
    await updateChallengeProgress.execute(
      {
        userId: dto.userId,
        goalType: ChallengeGoal.TOTAL_XP,
        increment: dto.amount,
      },
      client as PrismaTransaction,
    );

    if (newLevel > user.level) {
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
