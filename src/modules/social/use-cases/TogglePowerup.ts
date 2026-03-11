import { ForbiddenError, NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";
import { createAndEmitNotification } from "../../../lib/notifications.js";
import { areFriends } from "../../../lib/social.js";
import { CheckAchievements } from "../../gamification/use-cases/CheckAchievements.js";
import { GrantXp } from "../../gamification/use-cases/GrantXp.js";

interface InputDto {
  userId: string;
  activityId: string;
}

export class TogglePowerup {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== dto.userId) {
      const friends = await areFriends(dto.userId, activity.userId);

      if (!friends) {
        throw new ForbiddenError(
          "You can only powerup activities from your friends",
        );
      }
    }

    const existingPowerup = await this.prisma.powerup.findUnique({
      where: {
        activityId_userId: {
          activityId: dto.activityId,
          userId: dto.userId,
        },
      },
    });

    if (existingPowerup) {
      await this.prisma.powerup.delete({
        where: { id: existingPowerup.id },
      });
    } else {
      await this.prisma.$transaction(async (tx: any) => {
        await tx.powerup.create({
          data: {
            activityId: dto.activityId,
            userId: dto.userId,
          },
        });

        const grantXp = new GrantXp(this.prisma);

        await grantXp.execute(
          {
            userId: dto.userId,
            amount: 5,
            reason: "POWERUP_GIVEN",
            relatedId: dto.activityId,
          },
          tx,
        );

        if (activity.userId !== dto.userId) {
          await createAndEmitNotification(
            {
              recipientId: activity.userId,
              senderId: dto.userId,
              type: "POWERUP_RECEIVED",
              activityId: activity.id,
            },
            tx,
          );

          await grantXp.execute(
            {
              userId: activity.userId,
              amount: 10,
              reason: "POWERUP_RECEIVED",
              relatedId: `${dto.activityId}_${dto.userId}`,
            },
            tx,
          );
        }
      });

      const checkAchievements = new CheckAchievements(this.prisma);
      await Promise.all([
        checkAchievements.execute({ userId: dto.userId }),
        activity.userId !== dto.userId
          ? checkAchievements.execute({ userId: activity.userId })
          : Promise.resolve(),
      ]);
    }
  }
}
