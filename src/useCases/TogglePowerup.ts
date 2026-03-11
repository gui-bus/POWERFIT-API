import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { notificationEvents } from "../lib/events.js";
import { CheckAchievements } from "./CheckAchievements.js";
import { GrantXp } from "./GrantXp.js";

interface InputDto {
  userId: string;
  activityId: string;
}

export class TogglePowerup {
  async execute(dto: InputDto): Promise<void> {
    const activity = await prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== dto.userId) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: dto.userId, friendId: activity.userId },
            { userId: activity.userId, friendId: dto.userId },
          ],
          status: "ACCEPTED",
        },
      });

      if (!friendship) {
        throw new ForbiddenError(
          "You can only powerup activities from your friends",
        );
      }
    }

    const existingPowerup = await prisma.powerup.findUnique({
      where: {
        activityId_userId: {
          activityId: dto.activityId,
          userId: dto.userId,
        },
      },
    });

    if (existingPowerup) {
      await prisma.powerup.delete({
        where: { id: existingPowerup.id },
      });
    } else {
      const notification = await prisma.$transaction(async (tx) => {
        await tx.powerup.create({
          data: {
            activityId: dto.activityId,
            userId: dto.userId,
          },
        });

        const grantXp = new GrantXp();

        await grantXp.execute(
          {
            userId: dto.userId,
            amount: 5,
            reason: "POWERUP_GIVEN",
            relatedId: dto.activityId,
          },
          tx,
        );

        let notif = null;
        if (activity.userId !== dto.userId) {
          notif = await tx.notification.create({
            data: {
              recipientId: activity.userId,
              senderId: dto.userId,
              type: "POWERUP_RECEIVED",
              activityId: activity.id,
            },
            include: { sender: true },
          });

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
        return notif;
      });

      if (notification) {
        notificationEvents.emit("new-notification", notification);
      }

      const checkAchievements = new CheckAchievements();
      checkAchievements.execute({ userId: dto.userId }).catch(console.error);
      if (activity.userId !== dto.userId) {
        checkAchievements
          .execute({ userId: activity.userId })
          .catch(console.error);
      }
    }
  }
}
