import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetFriends } from "../src/useCases/GetFriends.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    friendship: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetFriends Use Case", () => {
  it("should return a list of friends for a user", async () => {
    const userId = "me";
    const mockFriendships = [
      {
        userId: "me",
        friendId: "friend-1",
        createdAt: new Date(),
        friend: {
          id: "friend-1",
          name: "Friend One",
          email: "f1@test.com",
          image: null,
          friendCode: "#F1",
        },
      },
      {
        userId: "friend-2",
        friendId: "me",
        createdAt: new Date(),
        user: {
          id: "friend-2",
          name: "Friend Two",
          email: "f2@test.com",
          image: null,
          friendCode: "#F2",
        },
      },
    ];

    (prisma.friendship.findMany as any).mockResolvedValue(mockFriendships);

    const getFriends = new GetFriends();
    const result = await getFriends.execute({ userId });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Friend One");
    expect(result[1].name).toBe("Friend Two");
  });
});
