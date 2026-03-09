import { prisma } from "../lib/db.js";
import { ensureInitialAchievements } from "../lib/gamification.js";
import { GrantXp } from "./GrantXp.js";

interface InputDto {
  userId: string;
}

export class CheckAchievements {
  async execute(dto: InputDto): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Garantir que as medalhas existam no banco
      await ensureInitialAchievements(tx);

      // 2. Buscar medalhas pendentes
      const unlockedAchievements = await tx.userAchievement.findMany({
        where: { userId: dto.userId },
        select: { achievementId: true },
      });
      
      const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);

      const pendingAchievements = await tx.achievement.findMany({
        where: { id: { notIn: unlockedIds } },
      });

      if (pendingAchievements.length === 0) return;

      const grantXp = new GrantXp();

      for (const achievement of pendingAchievements) {
        let shouldUnlock = false;

        if (achievement.name === "Primeiro Passo") {
          const workoutCount = await tx.workoutSession.count({
            where: {
              workoutDay: { workoutPlan: { userId: dto.userId } },
              completedAt: { not: null },
            },
          });
          if (workoutCount >= 1) shouldUnlock = true;
        }

        if (achievement.name === "Socializador") {
          const friendCount = await tx.friendship.count({
            where: {
              OR: [{ userId: dto.userId }, { friendId: dto.userId }],
            },
          });
          if (friendCount >= 1) shouldUnlock = true;
        }

        if (achievement.name === "Mestre do Incentivo") {
          const powerupCount = await tx.powerup.count({
            where: { userId: dto.userId },
          });
          if (powerupCount >= 1) shouldUnlock = true;
        }

        if (shouldUnlock) {
          await tx.userAchievement.create({
            data: {
              userId: dto.userId,
              achievementId: achievement.id,
            },
          });

          await tx.notification.create({
            data: {
              recipientId: dto.userId,
              type: "ACHIEVEMENT_UNLOCKED",
              achievementId: achievement.id,
            },
          });

          if (achievement.xpReward > 0) {
            await grantXp.execute(
              {
                userId: dto.userId,
                amount: achievement.xpReward,
                reason: "CHALLENGE_COMPLETED",
                relatedId: achievement.id,
              },
              tx,
            );
          }
        }
      }
    });
  }
}
