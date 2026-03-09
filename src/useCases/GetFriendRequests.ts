import { FriendshipStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
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
    const requests = await prisma.friendship.findMany({
      where: {
        friendId: dto.userId,
        status: "PENDING",
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests.map((req) => ({
      id: req.id,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        image: req.user.image,
      },
    }));
  }
}
