import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { prisma } from "../lib/db.js";

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

    // Fetch all users with basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
      },
    });

    // Fetch all completed sessions for streak calculation
    const sessions = await prisma.workoutSession.findMany({
      where: {
        completedAt: {
          not: null,
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

    // Group sessions by userId
    const userSessionsMap = new Map<string, Set<string>>();
    sessions.forEach((session) => {
      const userId = session.workoutDay.workoutPlan.userId;
      const date = dayjs.utc(session.startedAt).format("YYYY-MM-DD");

      if (!userSessionsMap.has(userId)) {
        userSessionsMap.set(userId, new Set());
      }
      userSessionsMap.get(userId)!.add(date);
    });

    // Map users to ranking data with calculated streak
    let rankings: UserRanking[] = users.map((user) => {
      const completedDates = userSessionsMap.get(user.id) || new Set();
      
      let streak = 0;
      let checkDate = today;

      // If today is not completed, check if yesterday was. If not, streak is 0.
      if (!completedDates.has(checkDate.format("YYYY-MM-DD"))) {
        checkDate = checkDate.subtract(1, "day");
      }

      while (completedDates.has(checkDate.format("YYYY-MM-DD"))) {
        streak++;
        checkDate = checkDate.subtract(1, "day");
      }

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        streak,
        xp: user.xp,
        level: user.level,
      };
    });

    // Sort based on requested criteria
    if (dto.sortBy === "STREAK") {
      rankings.sort((a, b) => {
        if (b.streak !== a.streak) {
          return b.streak - a.streak;
        }
        if (b.xp !== a.xp) {
          return b.xp - a.xp;
        }
        return a.name.localeCompare(b.name);
      });
    } else {
      rankings.sort((a, b) => {
        if (b.xp !== a.xp) {
          return b.xp - a.xp;
        }
        if (b.streak !== a.streak) {
          return b.streak - a.streak;
        }
        return a.name.localeCompare(b.name);
      });
    }

    const top10 = rankings.slice(0, 10);
    const currentUserPosition = rankings.findIndex((r) => r.id === dto.userId) + 1;

    return {
      ranking: top10,
      currentUserPosition: currentUserPosition > 0 ? currentUserPosition : null,
    };
  }
}
