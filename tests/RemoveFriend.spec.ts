import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { RemoveFriend } from "../src/modules/social/use-cases/RemoveFriend.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    friendship: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("RemoveFriend Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should remove a friendship if it exists", async () => {
    const userId = "user-1";
    const friendId = "user-2";
    const friendshipId = "friendship-id";

    (prisma.friendship.findFirst as any).mockResolvedValue({
      id: friendshipId,
      userId,
      friendId,
    });

    const removeFriend = new RemoveFriend();
    await removeFriend.execute({ userId, friendId });

    expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    expect(prisma.friendship.delete).toHaveBeenCalledWith({
      where: { id: friendshipId },
    });
  });

  it("should throw an error if friendship does not exist", async () => {
    const userId = "user-1";
    const friendId = "user-2";

    (prisma.friendship.findFirst as any).mockResolvedValue(null);

    const removeFriend = new RemoveFriend();

    await expect(removeFriend.execute({ userId, friendId })).rejects.toThrow("Friendship not found");
  });
});
