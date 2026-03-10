import { describe, expect, it, vi, beforeEach } from "vitest";
import { GetUserProfile } from "../src/useCases/GetUserProfile.js";
import { prisma } from "../src/lib/db.js";
import { NotFoundError } from "../src/errors/index.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    friendship: {
      findFirst: vi.fn(),
    },
    workoutSession: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe("GetUserProfile Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return public profile data and friendship status", async () => {
    const userId = "me";
    const targetUserId = "target";

    (prisma.user.findUnique as any).mockResolvedValue({
      id: targetUserId,
      name: "Target User",
      isPublicProfile: true,
      xp: 1000,
      level: 5,
      _count: { activities: 10 },
      achievements: [],
      friends: [{ status: "ACCEPTED" }],
      friendOf: []
    });

    (prisma.friendship.findFirst as any).mockResolvedValue({ status: "ACCEPTED" });

    const getUserProfile = new GetUserProfile();
    const result = await getUserProfile.execute({ userId, targetUserId });

    expect(result.id).toBe(targetUserId);
    expect(result.isFriend).toBe(true);
  });

  it("should throw NotFoundError if user doesn't exist", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const getUserProfile = new GetUserProfile();
    await expect(getUserProfile.execute({ userId: "me", targetUserId: "none" })).rejects.toThrow(NotFoundError);
  });
});
