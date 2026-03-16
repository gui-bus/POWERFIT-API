import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetRanking } from "../src/modules/gamification/use-cases/GetRanking.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    friendship: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
    workoutSession: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe("GetRanking Bug Fix Verification", () => {
  it("should NOT filter by friends if friendsOnly is false", async () => {
    const userId = "me";
    
    // Mock multiple users
    (prisma.user.findMany as any).mockResolvedValue([
      { id: "user-1", name: "User 1", xp: 100, level: 1, image: null },
      { id: "user-2", name: "User 2", xp: 200, level: 2, image: null },
      { id: "me", name: "Me", xp: 50, level: 1, image: null },
    ]);

    const getRanking = new GetRanking(prisma as any);
    
    // Test with friendsOnly: false
    const result = await getRanking.execute({ 
      userId, 
      sortBy: "XP", 
      friendsOnly: false 
    });

    // Should return all users, not just "me"
    expect(result.ranking).toHaveLength(3);
    // Should NOT have called friendship table
    expect(prisma.friendship.findMany).not.toHaveBeenCalled();
  });

  it("should handle friendsOnly correctly when it is true", async () => {
    const userId = "me";
    
    // Mock friendship
    (prisma.friendship.findMany as any).mockResolvedValue([
      { userId: "me", friendId: "friend-1", status: "ACCEPTED" }
    ]);

    // Mock filtered users
    (prisma.user.findMany as any).mockImplementation((args: any) => {
      const ids = args.where.id.in;
      if (ids.includes("friend-1") && ids.includes("me")) {
         return Promise.resolve([
            { id: "friend-1", name: "Friend", xp: 100, level: 1, image: null },
            { id: "me", name: "Me", xp: 50, level: 1, image: null },
         ]);
      }
      return Promise.resolve([]);
    });

    const getRanking = new GetRanking(prisma as any);
    
    const result = await getRanking.execute({ 
      userId, 
      sortBy: "XP", 
      friendsOnly: true 
    });

    expect(result.ranking).toHaveLength(2);
    expect(prisma.friendship.findMany).toHaveBeenCalled();
  });
});
