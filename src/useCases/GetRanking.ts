import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { prisma } from "../lib/db.js";
import { calculateStreak } from "../lib/gamification.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  sortBy: "STREAK" | "XP";
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
  async execute(dto: InputDto): Promise<OutputDto> {
    const today = dayjs.utc().startOf("day");
    
    // Only fetch users who have at least some XP or are the current user
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { xp: { gt: 0 } },
          { id: dto.userId }
        ]
      },
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
      },
    });

    // Only fetch sessions from the last 40 days to calculate current streaks
    // Streaks are current, so we only need recent history.
    const sessions = await prisma.workoutSession.findMany({
      where: {
        completedAt: {
          not: null,
        },
        startedAt: {
          gte: today.subtract(40, "day").toDate(),
        }
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
