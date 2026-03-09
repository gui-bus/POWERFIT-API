import dayjs from "dayjs";

import {
  ForbiddenError,
  NotFoundError,
  SessionAlreadyCompletedError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { CheckAchievements } from "./CheckAchievements.js";
import { GrantXp } from "./GrantXp.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  statusMessage?: string;
  taggedUserIds?: string[];
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

      const activity = await tx.activity.create({
        data: {
          userId: dto.userId,
          workoutDayId: dto.workoutDayId,
          workoutSessionId: updatedSession.id,
          statusMessage: dto.statusMessage,
          taggedUsers: dto.taggedUserIds ? {
            connect: dto.taggedUserIds.map(id => ({ id }))
          } : undefined
        },
      });

      // Notificar usuários marcados
      if (dto.taggedUserIds && dto.taggedUserIds.length > 0) {
        await tx.notification.createMany({
          data: dto.taggedUserIds.map(taggedId => ({
            recipientId: taggedId,
            senderId: dto.userId,
            type: "TAGGED_IN_ACTIVITY",
            activityId: activity.id,
          }))
        });
      }

      const grantXp = new GrantXp();
      await grantXp.execute(
        {
          userId: dto.userId,
          amount: 50,
          reason: "WORKOUT_COMPLETED",
          relatedId: updatedSession.id,
        },
        tx,
      );

      return {
        id: updatedSession.id,
        workoutDayId: updatedSession.workoutDayId,
        startedAt: updatedSession.startedAt.toISOString(),
        completedAt: updatedSession.completedAt!.toISOString(),
      };
    }).then(async (result) => {
      const checkAchievements = new CheckAchievements();
      checkAchievements.execute({ userId: dto.userId }).catch(console.error);
      return result;
    });
  }
}
