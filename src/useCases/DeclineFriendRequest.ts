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
        friendId: dto.userId, // Apenas quem recebeu pode recusar
        status: "PENDING",
      },
    });

    if (!request) {
      throw new NotFoundError("Friend request not found or unauthorized");
    }

    // Simplesmente deletamos a relação pendente
    await prisma.friendship.delete({
      where: { id: dto.requestId },
    });
  }
}
