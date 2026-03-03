import dayjs from "dayjs";

import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  id: string;
  name: string;
  isRestDay: boolean;
  coverImageUrl?: string | null;
  estimatedDurationInSeconds: number;
  exercises: Array<{
    id: string;
    name: string;
    order: number;
    workoutDayId: string;
    sets: number;
    reps: number;
    restTimeInSeconds: number;
  }>;
  weekDay: WeekDay;
  sessions: Array<{
    id: string;
    workoutDayId: string;
    startedAt?: string | null;
    completedAt?: string | null;
  }>;
}

export class GetWorkoutDay {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutDay = await prisma.workoutDay.findUnique({
      where: {
        id: dto.workoutDayId,
      },
      include: {
        workoutPlan: true,
        exercises: true,
        sessions: true,
      },
    });

    if (!workoutDay || workoutDay.workoutPlanId !== dto.workoutPlanId) {
      throw new NotFoundError("Workout day not found");
    }

    if (workoutDay.workoutPlan.userId !== dto.userId) {
      throw new ForbiddenError(
        "You don't have permission to access this workout day",
      );
    }

    return {
      id: workoutDay.id,
      name: workoutDay.name,
      isRestDay: workoutDay.isRestDay,
      coverImageUrl: workoutDay.coverImageUrl,
      estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
      weekDay: workoutDay.weekDay,
      exercises: workoutDay.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        order: exercise.order,
        workoutDayId: exercise.workoutDayId,
        sets: exercise.sets,
        reps: exercise.reps,
        restTimeInSeconds: exercise.restTimeInSeconds,
      })),
      sessions: workoutDay.sessions.map((session) => ({
        id: session.id,
        workoutDayId: session.workoutDayId,
        startedAt: session.startedAt
          ? dayjs(session.startedAt).format("YYYY-MM-DD")
          : null,
        completedAt: session.completedAt
          ? dayjs(session.completedAt).format("YYYY-MM-DD")
          : null,
      })),
    };
  }
}
