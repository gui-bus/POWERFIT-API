import dayjs from "dayjs";

import {
  ForbiddenError,
  NotFoundError,
  SessionAlreadyCompletedError,
} from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";
import { createAndEmitNotifications } from "../../../lib/notifications.js";
import { CheckAchievements } from "../../gamification/use-cases/CheckAchievements.js";
import { GrantXp } from "../../gamification/use-cases/GrantXp.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  statusMessage?: string;
  imageUrl?: string;
  taggedUserIds?: string[];
}

interface OutputDto {
  id: string;
  workoutDayId: string;
  startedAt: string;
  completedAt: string;
}

export class CompleteWorkoutSession {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const sessionResult = await this.prisma.$transaction(async (tx) => {
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
        throw new SessionAlreadyCompletedError(
          "This session is already completed",
        );
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
          imageUrl: dto.imageUrl,
          taggedUsers: dto.taggedUserIds
            ? {
                connect: dto.taggedUserIds.map((id) => ({ id })),
              }
            : undefined,
        },
      });

      if (dto.taggedUserIds && dto.taggedUserIds.length > 0) {
        await createAndEmitNotifications(
          dto.taggedUserIds.map((taggedId) => ({
            recipientId: taggedId,
            senderId: dto.userId,
            type: "TAGGED_IN_ACTIVITY",
            activityId: activity.id,
          })),
          tx,
        );
      }

      const grantXp = new GrantXp(this.prisma);
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
        startedAt: dayjs(updatedSession.startedAt).toISOString(),
        completedAt: dayjs(updatedSession.completedAt!).toISOString(),
      };
    });

    const checkAchievements = new CheckAchievements(this.prisma);
    await checkAchievements.execute({ userId: dto.userId });

    return sessionResult;
  }
}
