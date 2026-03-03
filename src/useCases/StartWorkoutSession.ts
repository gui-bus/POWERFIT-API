import dayjs from "dayjs";

import {
  ForbiddenError,
  NotFoundError,
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface OutputDto {
  id: string;
  workoutDayId: string;
  startedAt: string;
  completedAt: string | null;
}

export class StartWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
      include: {
        workoutDays: {
          where: { id: dto.workoutDayId },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new ForbiddenError("You do not have permission to access this workout plan");
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError("This workout plan is not active");
    }

    const workoutDay = workoutPlan.workoutDays[0];

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found in this plan");
    }

    const activeSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId: dto.workoutDayId,
        completedAt: null,
      },
    });

    if (activeSession) {
      throw new SessionAlreadyStartedError("There is already an active session for this workout day");
    }

    const workoutSession = await prisma.workoutSession.create({
      data: {
        id: crypto.randomUUID(),
        workoutDayId: dto.workoutDayId,
        startedAt: dayjs().toDate(),
      },
    });

    return {
      id: workoutSession.id,
      workoutDayId: workoutSession.workoutDayId,
      startedAt: workoutSession.startedAt.toISOString(),
      completedAt: workoutSession.completedAt ? workoutSession.completedAt.toISOString() : null,
    };
  }
}
