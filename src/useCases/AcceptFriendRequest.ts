import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  requestId: string;
}

export class AcceptFriendRequest {
  async execute(dto: InputDto): Promise<void> {
    const request = await prisma.friendship.findFirst({
      where: {
        id: dto.requestId,
        friendId: dto.userId, // Apenas quem recebeu pode aceitar
        status: "PENDING",
      },
    });

    if (!request) {
      throw new NotFoundError("Friend request not found or unauthorized");
    }

    await prisma.$transaction([
      prisma.friendship.update({
        where: { id: dto.requestId },
        data: { status: "ACCEPTED" },
      }),
      prisma.notification.create({
        data: {
          recipientId: request.userId, // O remetente da solicitação recebe o aviso
          senderId: dto.userId,
          type: "FRIEND_ACCEPTED",
        },
      }),
    ]);
  }
}
