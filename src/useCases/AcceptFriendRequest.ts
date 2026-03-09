import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
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
        friendId: dto.userId, // Apenas quem recebeu pode aceitar
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

      await tx.notification.create({
        data: {
          recipientId: request.userId, // O remetente da solicitação recebe o aviso
          senderId: dto.userId,
          type: "FRIEND_ACCEPTED",
        },
      });

      const grantXp = new GrantXp();

      // XP para quem aceitou
      await grantXp.execute(
        {
          userId: dto.userId,
          amount: 20,
          reason: "FRIEND_ACCEPTED",
          relatedId: request.id,
        },
        tx,
      );

      // XP para quem enviou a solicitação
      await grantXp.execute(
        {
          userId: request.userId,
          amount: 20,
          reason: "FRIEND_ACCEPTED",
          relatedId: request.id,
        },
        tx,
      );
    }).then(async () => {
      const checkAchievements = new CheckAchievements();
      checkAchievements.execute({ userId: dto.userId }).catch(console.error);
      checkAchievements.execute({ userId: request.userId }).catch(console.error);
    });
  }
}
