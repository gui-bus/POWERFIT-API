import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  requestId: string;
}

export class DeclineFriendRequest {
  async execute(dto: InputDto): Promise<void> {
    const request = await prisma.friendship.findFirst({
      where: {
        id: dto.requestId,
        OR: [{ userId: dto.userId }, { friendId: dto.userId }],
        status: "PENDING",
      },
    });

    if (!request) {
      throw new NotFoundError("Friend request not found or unauthorized");
    }

    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({
        where: {
          recipientId: request.friendId,
          senderId: request.userId,
          type: "FRIEND_REQUEST",
        },
      });

      await tx.friendship.delete({
        where: { id: dto.requestId },
      });
    });
  }
}
