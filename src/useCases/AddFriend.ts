import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

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
}

export class AddFriend {
  async execute(dto: InputDto): Promise<OutputDto> {
    const friend = await prisma.user.findFirst({
      where: {
        OR: [
          { friendCode: dto.codeOrEmail.toUpperCase().startsWith("#") ? dto.codeOrEmail.toUpperCase() : `#${dto.codeOrEmail.toUpperCase()}` },
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

    // Check if already friends or request exists
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

    await prisma.$transaction([
      prisma.friendship.create({
        data: {
          userId: dto.userId,
          friendId: friend.id,
          status: "PENDING",
        },
      }),
      prisma.notification.create({
        data: {
          recipientId: friend.id,
          senderId: dto.userId,
          type: "FRIEND_REQUEST",
        },
      }),
    ]);

    return {
      id: friend.id,
      name: friend.name,
      email: friend.email,
      image: friend.image,
      friendCode: friend.friendCode,
    };
  }
}
