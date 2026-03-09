import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { GrantXp } from "./GrantXp.js";

interface InputDto {
  userId: string;
  activityId: string;
  content: string;
}

export class AddComment {
  async execute(dto: InputDto): Promise<void> {
    const activity = await prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.comment.create({
        data: {
          activityId: dto.activityId,
          userId: dto.userId,
          content: dto.content,
        },
      });

      const grantXp = new GrantXp();
      
      // Ganha 2 XP por comentar (limitado a uma vez por atividade para evitar spam)
      await grantXp.execute(
        {
          userId: dto.userId,
          amount: 2,
          reason: "COMMENT_GIVEN",
          relatedId: `comment_${dto.activityId}`,
        },
        tx,
      );

      // Notifica o dono da atividade (se não for o próprio comentador)
      if (activity.userId !== dto.userId) {
        await tx.notification.create({
          data: {
            recipientId: activity.userId,
            senderId: dto.userId,
            type: "COMMENT_RECEIVED",
            activityId: activity.id,
          },
        });
      }
    });
  }
}
