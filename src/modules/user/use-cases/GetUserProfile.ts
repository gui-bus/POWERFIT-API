import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { ForbiddenError, NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";
import { calculateStreak } from "../../../lib/gamification.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  targetUserId: string;
}

interface OutputDto {
  id: string;
  name: string;
  image: string | null;
  level: number;
  xp: number;
  streak: number;
  isFriend: boolean;
  isPending: boolean;
  stats: {
    weightInGrams: number;
    heightInCentimeters: number;
    age: number;
    bodyFatPercentage: number;
  } | null;
  achievements: Array<{
    id: string;
    name: string;
    iconUrl: string | null;
    unlockedAt: string;
  }>;
}

export class GetUserProfile {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
      include: {
        trainData: true,
        achievements: {
          include: { achievement: true },
          orderBy: { unlockedAt: "desc" },
        },
        friends: {
          where: { friendId: dto.userId },
        },
        friendOf: {
          where: { userId: dto.userId },
        },
      },
    });

    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    const friendship = targetUser.friends[0] || targetUser.friendOf[0];
    const isFriend = friendship?.status === "ACCEPTED";
    const isPending = friendship?.status === "PENDING";

    if (
      !targetUser.isPublicProfile &&
      !isFriend &&
      dto.userId !== dto.targetUserId
    ) {
      throw new ForbiddenError("This profile is private");
    }

    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlan: { userId: dto.targetUserId } },
        completedAt: { not: null },
      },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
    });

    const completedDates = new Set(
      sessions.map((s) => dayjs.utc(s.startedAt).format("YYYY-MM-DD")),
    );

    const streak = calculateStreak(completedDates);

    const canSeeStats = dto.userId === dto.targetUserId || targetUser.showStats;

    return {
      id: targetUser.id,
      name: targetUser.name,
      image: targetUser.image,
      level: targetUser.level,
      xp: targetUser.xp,
      streak,
      isFriend,
      isPending,
      stats:
        canSeeStats && targetUser.trainData
          ? {
              weightInGrams: targetUser.trainData.weightInGrams,
              heightInCentimeters: targetUser.trainData.heightInCentimeters,
              age: targetUser.trainData.age,
              bodyFatPercentage: targetUser.trainData.bodyFatPercentage,
            }
          : null,
      achievements: targetUser.achievements.map((ua) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        iconUrl: ua.achievement.iconUrl,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
    };
  }
}
