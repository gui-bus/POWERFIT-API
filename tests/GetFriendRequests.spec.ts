import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetFriendRequests } from "../src/useCases/GetFriendRequests.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    friendship: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetFriendRequests Use Case", () => {
  it("should return received friend requests", async () => {
    const userId = "me";
    const mockRequests = [
      {
        id: "req-1",
        status: "PENDING",
        createdAt: new Date(),
        user: {
          id: "sender-1",
          name: "Sender",
          email: "s@test.com",
          image: null,
        },
      },
    ];

    (prisma.friendship.findMany as any).mockResolvedValue(mockRequests);

    const getRequests = new GetFriendRequests();
    const result = await getRequests.execute({ userId, type: "RECEIVED" });

    expect(result).toHaveLength(1);
    expect(result[0].user.name).toBe("Sender");
    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { friendId: userId, status: "PENDING" },
      }),
    );
  });

  it("should return sent friend requests", async () => {
    const userId = "me";
    const mockRequests = [
      {
        id: "req-2",
        status: "PENDING",
        createdAt: new Date(),
        friend: {
          id: "friend-1",
          name: "Target",
          email: "t@test.com",
          image: null,
        },
      },
    ];

    (prisma.friendship.findMany as any).mockResolvedValue(mockRequests);

    const getRequests = new GetFriendRequests();
    const result = await getRequests.execute({ userId, type: "SENT" });

    expect(result).toHaveLength(1);
    expect(result[0].user.name).toBe("Target");
    expect(prisma.friendship.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: userId, status: "PENDING" },
      }),
    );
  });
});
