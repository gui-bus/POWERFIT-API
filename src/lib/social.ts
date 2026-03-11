import { prisma, PrismaTransaction } from "./db.js";

export const getFriendship = async (
  userId1: string,
  userId2: string,
  tx?: PrismaTransaction,
) => {
  const client = tx || prisma;
  return client.friendship.findFirst({
    where: {
      OR: [
        { userId: userId1, friendId: userId2 },
        { userId: userId2, friendId: userId1 },
      ],
    },
  });
};

export const areFriends = async (
  userId1: string,
  userId2: string,
  tx?: PrismaTransaction,
) => {
  const friendship = await getFriendship(userId1, userId2, tx);
  return friendship?.status === "ACCEPTED";
};

export const isFriendshipPending = async (
  userId1: string,
  userId2: string,
  tx?: PrismaTransaction,
) => {
  const friendship = await getFriendship(userId1, userId2, tx);
  return friendship?.status === "PENDING";
};
