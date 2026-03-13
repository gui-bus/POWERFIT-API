import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  friendId: string;
}

export class RemoveFriend {
  async execute(dto: InputDto): Promise<void> {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: dto.userId, friendId: dto.friendId },
          { userId: dto.friendId, friendId: dto.userId },
        ],
      },
    });

    if (!friendship) {
      throw new AppError("Friendship not found", "NOT_FOUND", 404);
    }

    await prisma.friendship.delete({
      where: { id: friendship.id },
    });
  }
}
