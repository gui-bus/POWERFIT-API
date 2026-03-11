import { describe, expect, it, vi } from "vitest";
import { GetFeed } from "../src/useCases/GetFeed.js";
import { prisma } from "../src/lib/db.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    friendship: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    activity: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetFeed Use Case", () => {
  it("should return public feed for user and friends", async () => {
    const userId = "user-1";
    const friendId = "user-2";

    (prisma.friendship.findMany as any).mockResolvedValue([
      { userId: userId, friendId: friendId, status: "ACCEPTED" },
    ]);

    (prisma.activity.findMany as any).mockResolvedValue([]);

    const getFeed = new GetFeed();
    await getFeed.execute({ userId });

    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { userId: { in: [friendId, userId] } },
            { taggedUsers: { some: { id: { in: [friendId, userId] } } } },
          ],
        },
      }),
    );
  });

  it("should throw error when trying to view feed of non-friend user", async () => {
    const userId = "user-1";
    const targetUserId = "stranger-1";

    (prisma.friendship.findFirst as any).mockResolvedValue(null);

    const getFeed = new GetFeed();
    await expect(getFeed.execute({ userId, targetUserId })).rejects.toThrow(
      "You can only view feeds of your friends",
    );
  });
});
