import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { createAndEmitNotification } from "../lib/notifications.js";
import { CheckAchievements } from "./CheckAchievements.js";
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

      await grantXp.execute(
        {
          userId: dto.userId,
          amount: 2,
          reason: "COMMENT_GIVEN",
          relatedId: `comment_${dto.activityId}`,
        },
        tx,
      );

      if (activity.userId !== dto.userId) {
        await createAndEmitNotification(
          {
            recipientId: activity.userId,
            senderId: dto.userId,
            type: "COMMENT_RECEIVED",
            activityId: activity.id,
            content:
              dto.content.length > 50
                ? `${dto.content.substring(0, 47)}...`
                : dto.content,
          },
          tx,
        );
      }
    });

    const checkAchievements = new CheckAchievements();
    await Promise.all([
      checkAchievements.execute({ userId: dto.userId }),
      activity.userId !== dto.userId
        ? checkAchievements.execute({ userId: activity.userId })
        : Promise.resolve(),
    ]);
  }
}
