import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  query: string;
}

interface OutputDto {
  id: string;
  name: string;
  image: string | null;
  friendCode: string | null;
  level: number;
  isFriend: boolean;
  isPending: boolean;
}

export class SearchUsers {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: dto.userId } },
          {
            OR: [
              { name: { contains: dto.query, mode: "insensitive" } },
              { email: { contains: dto.query, mode: "insensitive" } },
              { friendCode: { contains: dto.query, mode: "insensitive" } },
            ],
          },
          {
            OR: [
              { isPublicProfile: true },
              { friends: { some: { friendId: dto.userId } } },
              { friendOf: { some: { userId: dto.userId } } },
            ],
          },
        ],
      },
      include: {
        friends: {
          where: { friendId: dto.userId },
        },
        friendOf: {
          where: { userId: dto.userId },
        },
      },
      take: 20,
    });

    return users.map((user: any) => {
      const friendship = user.friends[0] || user.friendOf[0];

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        friendCode: user.friendCode,
        level: user.level,
        isFriend: friendship?.status === "ACCEPTED",
        isPending: friendship?.status === "PENDING",
      };
    });
  }
}
