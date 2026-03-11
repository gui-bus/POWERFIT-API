import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { createAndEmitNotification } from "../lib/notifications.js";
import { CheckAchievements } from "./CheckAchievements.js";

interface InputDto {
  userId: string;
  codeOrEmail: string;
}

interface OutputDto {
  id: string;
  name: string;
  email: string;
  image: string | null;
  friendCode: string | null;
  xp: number;
  level: number;
  isPublicProfile: boolean;
  showStats: boolean;
}

export class AddFriend {
  async execute(dto: InputDto): Promise<OutputDto> {
    const friend = await prisma.user.findFirst({
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
      throw new Error("You cannot add yourself as a friend");
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: dto.userId, friendId: friend.id },
          { userId: friend.id, friendId: dto.userId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === "ACCEPTED") {
        throw new Error("You are already friends with this user");
      }
      throw new Error("A friend request is already pending");
    }

    await prisma.$transaction(async (tx) => {
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

    const checkAchievements = new CheckAchievements();
    await checkAchievements.execute({ userId: dto.userId });

    return {
      id: friend.id,
      name: friend.name,
      email: friend.email,
      image: friend.image,
      friendCode: friend.friendCode,
      xp: friend.xp,
      level: friend.level,
      isPublicProfile: friend.isPublicProfile,
      showStats: friend.showStats,
    };
  }
}
