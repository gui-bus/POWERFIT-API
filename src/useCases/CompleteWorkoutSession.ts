import dayjs from "dayjs";

import {
  ForbiddenError,
  NotFoundError,
  SessionAlreadyCompletedError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  statusMessage?: string;
}

interface OutputDto {
  id: string;
  workoutDayId: string;
  startedAt: string;
  completedAt: string;
}

export class CompleteWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    return prisma.$transaction(async (tx) => {
      const workoutPlan = await tx.workoutPlan.findUnique({
        where: { id: dto.workoutPlanId },
      });

      if (!workoutPlan) {
        throw new NotFoundError("Workout plan not found");
      }

      if (workoutPlan.userId !== dto.userId) {
        throw new ForbiddenError(
          "You do not have permission to access this workout plan",
        );
      }

      const workoutDay = await tx.workoutDay.findUnique({
        where: {
          id: dto.workoutDayId,
          workoutPlanId: dto.workoutPlanId,
        },
      });

      if (!workoutDay) {
        throw new NotFoundError("Workout day not found in this plan");
      }

      const workoutSession = await tx.workoutSession.findUnique({
        where: {
          id: dto.sessionId,
          workoutDayId: dto.workoutDayId,
        },
      });

      if (!workoutSession) {
        throw new NotFoundError("Workout session not found");
      }

      if (workoutSession.completedAt) {
        throw new SessionAlreadyCompletedError("This session is already completed");
      }

      const completedAt = dayjs().toDate();

      const updatedSession = await tx.workoutSession.update({
        where: { id: dto.sessionId },
        data: {
          completedAt,
        },
      });

      await tx.activity.create({
        data: {
          userId: dto.userId,
          workoutDayId: dto.workoutDayId,
          workoutSessionId: updatedSession.id,
          statusMessage: dto.statusMessage,
        },
      });

      return {
        id: updatedSession.id,
        workoutDayId: updatedSession.workoutDayId,
        startedAt: updatedSession.startedAt.toISOString(),
        completedAt: updatedSession.completedAt!.toISOString(),
      };
    });
  }
}
