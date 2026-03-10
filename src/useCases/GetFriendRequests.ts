import { FriendshipStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  type: "RECEIVED" | "SENT";
}

interface OutputDto {
  id: string;
  status: FriendshipStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export class GetFriendRequests {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    const isSent = dto.type === "SENT";

    const requests = await prisma.friendship.findMany({
      where: {
        userId: isSent ? dto.userId : undefined,
        friendId: isSent ? undefined : dto.userId,
        status: "PENDING",
      },
      include: {
        user: true, // O autor do pedido
        friend: true, // O destinatário do pedido
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map((req) => {
      // Se eu enviei, quero os dados do meu amigo (friend). 
      // Se eu recebi, quero os dados de quem enviou (user).
      const targetUser = isSent ? req.friend : req.user;

      return {
        id: req.id,
        status: req.status,
        createdAt: req.createdAt.toISOString(),
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          image: targetUser.image,
        },
      };
    });
  }
}
