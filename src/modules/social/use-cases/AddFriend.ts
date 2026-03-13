import { BadRequestError, NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";
import { createAndEmitNotification } from "../../../lib/notifications.js";
import { getFriendship } from "../../../lib/social.js";
import { CheckAchievements } from "../../gamification/use-cases/CheckAchievements.js";

interface InputDto {
  userId: string;
  codeOrEmail: string;
}

interface OutputDto {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  socialLinks: any;
  friendCode: string | null;
  xp: number;
  level: number;
  isPublicProfile: boolean;
  showStats: boolean;
}

export class AddFriend {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const friend = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: dto.codeOrEmail },
          {
            friendCode: dto.codeOrEmail.toUpperCase().startsWith("#")
              ? dto.codeOrEmail.toUpperCase()
              : `#${dto.codeOrEmail.toUpperCase()}`,
          },
          { email: dto.codeOrEmail.toLowerCase() },
        ],
      },
    });

    if (!friend) {
      throw new NotFoundError("User not found");
    }

    if (friend.id === dto.userId) {
      throw new BadRequestError("You cannot add yourself as a friend");
    }

    const existingFriendship = await getFriendship(dto.userId, friend.id);

    if (existingFriendship) {
      if (existingFriendship.status === "ACCEPTED") {
        throw new BadRequestError("You are already friends with this user");
      }
      throw new BadRequestError("A friend request is already pending");
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.friendship.create({
        data: {
          userId: dto.userId,
          friendId: friend.id,
          status: "PENDING",
        },
      });

      await createAndEmitNotification(
        {
          recipientId: friend.id,
          senderId: dto.userId,
          type: "FRIEND_REQUEST",
        },
        tx,
      );
    });

    const checkAchievements = new CheckAchievements(this.prisma);
    await checkAchievements.execute({ userId: dto.userId });

    return {
      id: friend.id,
      name: friend.name,
      email: friend.email,
      image: friend.image,
      bio: friend.bio,
      socialLinks: friend.socialLinks,
      friendCode: friend.friendCode,
      xp: friend.xp,
      level: friend.level,
      isPublicProfile: friend.isPublicProfile,
      showStats: friend.showStats,
    };
  }
}
