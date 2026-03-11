import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  id: string;
  name: string;
  email: string;
  image: string | null;
  friendCode: string | null;
  since: string;
}

export class GetFriends {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId: dto.userId }, { friendId: dto.userId }],
        status: "ACCEPTED",
      },
      include: {
        user: true,
        friend: true,
      },
    });

    return friendships.map((f: any) => {
      const friendData = f.userId === dto.userId ? f.friend : f.user;
      return {
        id: friendData.id,
        name: friendData.name,
        email: friendData.email,
        image: friendData.image,
        friendCode: friendData.friendCode,
        since: f.createdAt.toISOString(),
      };
    });
  }
}
