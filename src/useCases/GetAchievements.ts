import { prisma } from "../lib/db.js";
import { ensureInitialAchievements } from "../lib/gamification.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  xpReward: number;
  unlockedAt: string | null;
}

export class GetAchievements {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    await ensureInitialAchievements();

    const achievements = await prisma.achievement.findMany({
      include: {
        users: {
          where: { userId: dto.userId },
        },
      },
      orderBy: { name: "asc" },
    });

    return achievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      iconUrl: a.iconUrl,
      xpReward: a.xpReward,
      unlockedAt: a.users.length > 0 ? a.users[0].unlockedAt.toISOString() : null,
    }));
  }
}
