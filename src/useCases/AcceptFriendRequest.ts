import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { createAndEmitNotification } from "../lib/notifications.js";
import { CheckAchievements } from "./CheckAchievements.js";
import { GrantXp } from "./GrantXp.js";

interface InputDto {
  userId: string;
  requestId: string;
}

export class AcceptFriendRequest {
  async execute(dto: InputDto): Promise<void> {
    const request = await prisma.friendship.findFirst({
      where: {
        id: dto.requestId,
        friendId: dto.userId,
        status: "PENDING",
      },
    });

    if (!request) {
      throw new NotFoundError("Friend request not found or unauthorized");
    }

    await prisma.$transaction(async (tx) => {
      await tx.friendship.update({
        where: { id: dto.requestId },
        data: { status: "ACCEPTED" },
      });

      await createAndEmitNotification(
        {
          recipientId: request.userId,
          senderId: dto.userId,
          type: "FRIEND_ACCEPTED",
        },
        tx,
      );

      const grantXp = new GrantXp();

      await grantXp.execute(
        {
          userId: dto.userId,
          amount: 20,
          reason: "FRIEND_ACCEPTED",
          relatedId: request.id,
        },
        tx,
      );

      await grantXp.execute(
        {
          userId: request.userId,
          amount: 20,
          reason: "FRIEND_ACCEPTED",
          relatedId: request.id,
        },
        tx,
      );
    });

    const checkAchievements = new CheckAchievements();
    await Promise.all([
      checkAchievements.execute({ userId: dto.userId }),
      checkAchievements.execute({ userId: request.userId }),
    ]);
  }
}
