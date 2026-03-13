import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  targetUserId: string;
}

export class ToggleBlockUser {
  async execute(dto: InputDto): Promise<{ isBlocked: boolean }> {
    const existingBlock = await prisma.block.findFirst({
      where: { blockerId: dto.userId, blockedId: dto.targetUserId },
    });

    if (existingBlock) {
      await prisma.block.delete({ where: { id: existingBlock.id } });
      return { isBlocked: false };
    }

    await prisma.block.create({
      data: { blockerId: dto.userId, blockedId: dto.targetUserId },
    });

    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: dto.userId, friendId: dto.targetUserId },
          { userId: dto.targetUserId, friendId: dto.userId },
        ],
      },
    });

    return { isBlocked: true };
  }
}
