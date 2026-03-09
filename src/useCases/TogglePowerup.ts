import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

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

    // Se não for o próprio dono da atividade, verifica se são amigos
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
      await prisma.$transaction(async (tx) => {
        await tx.powerup.create({
          data: {
            activityId: dto.activityId,
            userId: dto.userId,
          },
        });

        if (activity.userId !== dto.userId) {
          await tx.notification.create({
            data: {
              recipientId: activity.userId,
              senderId: dto.userId,
              type: "POWERUP_RECEIVED",
              activityId: activity.id,
            },
          });
        }
      });
    }
  }
}
