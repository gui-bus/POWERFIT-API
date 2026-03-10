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
        OR: [
          { userId: dto.userId },   // Sou o autor (cancelando enviado)
          { friendId: dto.userId }, // Sou o destinatário (recusando recebido)
        ],
        status: "PENDING",
      },
    });

    if (!request) {
      throw new NotFoundError("Friend request not found or unauthorized");
    }

    await prisma.$transaction(async (tx) => {
      // Remover notificações pendentes vinculadas a este pedido de amizade
      // Para o FRIEND_REQUEST original
      await tx.notification.deleteMany({
        where: {
          recipientId: request.friendId,
          senderId: request.userId,
          type: "FRIEND_REQUEST",
        },
      });

      // Deletar a relação
      await tx.friendship.delete({
        where: { id: dto.requestId },
      });
    });
  }
}
