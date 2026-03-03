import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { prisma } from "../lib/db.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
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
  conclusionRate: number;
  totalTimeInSeconds: number;
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
    let totalTimeInSeconds = 0;

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
        completedWorkoutsCount++;

        const duration = dayjs(session.completedAt).diff(dayjs(session.startedAt), "second");
        totalTimeInSeconds += duration;
      }
    });

    const totalSessions = sessions.length;
    const conclusionRate = totalSessions > 0 ? completedWorkoutsCount / totalSessions : 0;

    // Calcular workoutStreak (mesma lógica do GetHomeData, mas baseada em todos os treinos completados até o fim do range)
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
      allCompletedSessions.map((s) => dayjs.utc(s.startedAt).format("YYYY-MM-DD"))
    );

    let streak = 0;
    let checkDate = toDate.startOf("day");

    // Se o último dia do range não tem treino completo, começa do dia anterior (conforme GetHomeData)
    if (!completedDates.has(checkDate.format("YYYY-MM-DD"))) {
      checkDate = checkDate.subtract(1, "day");
    }

    while (completedDates.has(checkDate.format("YYYY-MM-DD"))) {
      streak++;
      checkDate = checkDate.subtract(1, "day");
    }

    return {
      workoutStreak: streak,
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate,
      totalTimeInSeconds,
    };
  }
}
