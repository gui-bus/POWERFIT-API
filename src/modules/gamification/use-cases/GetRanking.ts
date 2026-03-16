import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { PrismaClient } from "../../../lib/db.js";
import { calculateStreak } from "../../../lib/gamification.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  sortBy: "STREAK" | "XP";
  friendsOnly?: boolean;
}

interface UserRanking {
  id: string;
  name: string;
  image: string | null;
  streak: number;
  xp: number;
  level: number;
}

interface OutputDto {
  ranking: UserRanking[];
  currentUserPosition: number | null;
}

export class GetRanking {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const today = dayjs.utc().startOf("day");

    let userIds: string[] | undefined = undefined;

    if (dto.friendsOnly === true) {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [{ userId: dto.userId }, { friendId: dto.userId }],
          status: "ACCEPTED",
        },
      });

      userIds = friendships.map((f) =>
        f.userId === dto.userId ? f.friendId : f.userId,
      );
      userIds.push(dto.userId);
    }
    
    // Fetch users (all or friends) who are not banned
    const users = await this.prisma.user.findMany({
      where: {
        id: userIds ? { in: userIds } : undefined,
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
      },
    });

    const fetchedUserIds = users.map((u) => u.id);

    // Only fetch sessions from the last 40 days for the fetched users to calculate current streaks
    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        completedAt: {
          not: null,
        },
        startedAt: {
          gte: today.subtract(40, "day").toDate(),
        },
        workoutDay: {
          workoutPlan: {
            userId: { in: fetchedUserIds },
          },
        },
      },
      select: {
        startedAt: true,
        workoutDay: {
          select: {
            workoutPlan: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    const userSessionsMap = new Map<string, Set<string>>();
    sessions.forEach((session) => {
      const userId = session.workoutDay.workoutPlan.userId;
      const date = dayjs.utc(session.startedAt).format("YYYY-MM-DD");

      if (!userSessionsMap.has(userId)) {
        userSessionsMap.set(userId, new Set());
      }
      userSessionsMap.get(userId)!.add(date);
    });

    const rankings: UserRanking[] = users.map((user) => {
      const completedDates = userSessionsMap.get(user.id) || new Set<string>();
      const streak = calculateStreak(completedDates, today);

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        streak,
        xp: user.xp,
        level: user.level,
      };
    });

    const sortFn = (a: UserRanking, b: UserRanking) => {
      if (dto.sortBy === "STREAK") {
        if (b.streak !== a.streak) return b.streak - a.streak;
        if (b.xp !== a.xp) return b.xp - a.xp;
      } else {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.streak !== a.streak) return b.streak - a.streak;
      }
      return a.name.localeCompare(b.name);
    };

    rankings.sort(sortFn);

    const top10 = rankings.slice(0, 10);
    const currentUserPosition =
      rankings.findIndex((r) => r.id === dto.userId) + 1;

    return {
      ranking: top10,
      currentUserPosition: currentUserPosition > 0 ? currentUserPosition : null,
    };
  }
}
