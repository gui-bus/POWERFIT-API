import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { prisma } from "../lib/db.js";
import { calculateStreak } from "../lib/gamification.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  from: string;
  to: string;
}

interface OutputDto {
  workoutStreak: number;
  consistencyByDay: {
    [key: string]: {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    };
  };
  completedWorkoutsCount: number;
  completedRestDays: number;
  conclusionRate: number;
  totalTimeInSeconds: number;
  totalVolumeInGrams: number;
}

export class GetStats {
  async execute(dto: InputDto): Promise<OutputDto> {
    const fromDate = dayjs.utc(dto.from).startOf("day");
    const toDate = dayjs.utc(dto.to).endOf("day");

    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
          },
        },
        startedAt: {
          gte: fromDate.toDate(),
          lte: toDate.toDate(),
        },
      },
      include: {
        workoutDay: true,
        sets: true,
      },
      orderBy: {
        startedAt: "asc",
      },
    });

    const consistencyByDay: {
      [key: string]: {
        workoutDayCompleted: boolean;
        workoutDayStarted: boolean;
      };
    } = {};

    let completedWorkoutsCount = 0;
    let completedRestDays = 0;
    let totalTimeInSeconds = 0;
    let totalVolumeInGrams = 0;

    sessions.forEach((session) => {
      const dateKey = dayjs.utc(session.startedAt).format("YYYY-MM-DD");
      const isCompleted = !!session.completedAt;

      if (!consistencyByDay[dateKey]) {
        consistencyByDay[dateKey] = {
          workoutDayCompleted: false,
          workoutDayStarted: true,
        };
      }

      if (isCompleted) {
        consistencyByDay[dateKey].workoutDayCompleted = true;

        if (session.workoutDay.isRestDay) {
          completedRestDays++;
        } else {
          completedWorkoutsCount++;
        }

        const duration = dayjs(session.completedAt).diff(
          dayjs(session.startedAt),
          "second",
        );
        totalTimeInSeconds += duration;

        session.sets.forEach((set) => {
          totalVolumeInGrams += set.weightInGrams * set.reps;
        });
      }
    });

    const totalSessions = sessions.length;
    const conclusionRate =
      totalSessions > 0
        ? (completedWorkoutsCount + completedRestDays) / totalSessions
        : 0;

    const allCompletedSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
          },
        },
        completedAt: {
          not: null,
        },
        startedAt: {
          lte: toDate.toDate(),
        },
      },
      select: {
        startedAt: true,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    const completedDates = new Set(
      allCompletedSessions.map((s) =>
        dayjs.utc(s.startedAt).format("YYYY-MM-DD"),
      ),
    );

    const streak = calculateStreak(completedDates, toDate.startOf("day"));

    return {
      workoutStreak: streak,
      consistencyByDay,
      completedWorkoutsCount,
      completedRestDays,
      conclusionRate,
      totalTimeInSeconds,
      totalVolumeInGrams,
    };
  }
}
