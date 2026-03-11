import { FriendshipStatus } from "../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";

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
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto[]> {
    const isSent = dto.type === "SENT";

    const requests = await this.prisma.friendship.findMany({
      where: {
        userId: isSent ? dto.userId : undefined,
        friendId: isSent ? undefined : dto.userId,
        status: "PENDING",
      },
      include: {
        user: true,
        friend: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map((req) => {
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
