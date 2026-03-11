import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetRanking } from "../src/modules/gamification/use-cases/GetRanking.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    workoutSession: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe("GetRanking Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return users ranked by XP", async () => {
    const userId = "me";
    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: "user-1",
        name: "Top 1",
        xp: 5000,
        level: 10,
        activities: [{ workoutSession: { startedAt: new Date() } }],
      },
      { id: "me", name: "Me", xp: 1000, level: 5, activities: [] },
    ]);

    const getRanking = new GetRanking(prisma as any);
    const result = await getRanking.execute({ userId, sortBy: "XP" });

    expect(result.ranking).toHaveLength(2);
    expect(result.currentUserPosition).toBe(2);
  });
});
