import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { WeekDay } from "../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";
import { calculateStreak } from "../../../lib/gamification.js";

dayjs.extend(utc);

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId: string | null;
  todayWorkoutDay: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRestDay: boolean;
    weekDay: WeekDay;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string | null;
    exercisesCount: number;
  } | null;
  workoutStreak: number;
  consistencyByDay: {
    [key: string]: {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    };
  };
}

const mapDayjsToPrismaWeekDay = (day: number): WeekDay => {
  const days: WeekDay[] = [
    WeekDay.SUNDAY,
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
  ];
  return days[day];
};

export class GetHomeData {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const targetDate = dayjs.utc(dto.date).startOf("day");
    const weekStart = targetDate.startOf("week");
    const weekEnd = targetDate.endOf("week");

    const activeWorkoutPlan = await this.prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true,
      },
      include: {
        workoutDays: {
          include: {
            _count: {
              select: { exercises: true },
            },
          },
        },
      },
    });

    const prismaWeekDay = mapDayjsToPrismaWeekDay(targetDate.day());
    const todayWorkoutDay = activeWorkoutPlan?.workoutDays.find(
      (day: any) => day.weekDay === prismaWeekDay,
    );

    const sessionsInWeek = await this.prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlanId: activeWorkoutPlan?.id ?? "none",
        },
        startedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate(),
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const sessionsMap = new Map<string, { completed: boolean }>();
    sessionsInWeek.forEach((s: any) => {
      const dateKey = dayjs.utc(s.startedAt).format("YYYY-MM-DD");
      const existing = sessionsMap.get(dateKey);
      sessionsMap.set(dateKey, {
        completed: existing?.completed || !!s.completedAt,
      });
    });

    const consistencyByDay: {
      [key: string]: {
        workoutDayCompleted: boolean;
        workoutDayStarted: boolean;
      };
    } = {};

    for (let i = 0; i < 7; i++) {
      const currentDay = weekStart.add(i, "day");
      const dayKey = currentDay.format("YYYY-MM-DD");
      const sessionData = sessionsMap.get(dayKey);

      consistencyByDay[dayKey] = {
        workoutDayCompleted: sessionData?.completed ?? false,
        workoutDayStarted: !!sessionData,
      };
    }

    const allCompletedSessions = await this.prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
          },
        },
        completedAt: {
          not: null,
        },
      },
      select: {
        startedAt: true,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    const completedDates = new Set<string>(
      allCompletedSessions.map((s: any) =>
        dayjs.utc(s.startedAt).format("YYYY-MM-DD"),
      ),
    );

    const streak = calculateStreak(completedDates, targetDate);

    return {
      activeWorkoutPlanId: activeWorkoutPlan?.id ?? null,
      todayWorkoutDay: todayWorkoutDay
        ? {
            workoutPlanId: todayWorkoutDay.workoutPlanId,
            id: todayWorkoutDay.id,
            name: todayWorkoutDay.name,
            isRestDay: todayWorkoutDay.isRestDay,
            weekDay: todayWorkoutDay.weekDay,
            estimatedDurationInSeconds:
              todayWorkoutDay.estimatedDurationInSeconds,
            coverImageUrl: todayWorkoutDay.coverImageUrl,
            exercisesCount: todayWorkoutDay._count.exercises,
          }
        : null,
      workoutStreak: streak,
      consistencyByDay,
    };
  }
}
