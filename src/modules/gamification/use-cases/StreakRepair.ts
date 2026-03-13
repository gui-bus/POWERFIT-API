import dayjs from "dayjs";

import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  newStreak: number;
  newXp: number;
}

export class StreakRepair {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) throw new AppError("User not found", "NOT_FOUND", 404);
    if (user.xp < 500) throw new AppError("Insufficient XP (500 required)", "BAD_REQUEST", 400);

    const lastSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDay: { workoutPlan: { userId: dto.userId } },
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
    });

    if (!lastSession) throw new AppError("No workout history to repair", "BAD_REQUEST", 400);

    const lastWorkoutDate = dayjs(lastSession.completedAt);
    const today = dayjs().startOf("day");

    if (lastWorkoutDate.isAfter(today.subtract(1, "day"))) {
      throw new AppError("Streak is still active, no repair needed", "BAD_REQUEST", 400);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.xpTransaction.create({
        data: {
          userId: dto.userId,
          amount: -500,
          reason: "STREAK_REPAIR",
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: dto.userId },
        data: { xp: { decrement: 500 } },
      });

      return {
        newStreak: 1, 
        newXp: updatedUser.xp,
      };
    });
  }
}
