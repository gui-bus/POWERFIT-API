import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetAchievements } from "../src/useCases/GetAchievements.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    achievement: { findMany: vi.fn() },
  },
}));

vi.mock("../src/lib/gamification.js", () => ({
  ensureInitialAchievements: vi.fn(),
}));

describe("GetAchievements Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all achievements and indicate which ones are unlocked", async () => {
    const userId = "user-1";
    (prisma.achievement.findMany as any).mockResolvedValue([
      {
        id: "ach-1",
        name: "Achievement 1",
        description: "Desc",
        iconUrl: null,
        xpReward: 100,
        users: [{ unlockedAt: new Date() }],
      },
      {
        id: "ach-2",
        name: "Achievement 2",
        description: "Desc",
        iconUrl: null,
        xpReward: 200,
        users: [],
      },
    ]);

    const getAchievements = new GetAchievements();
    const result = await getAchievements.execute({ userId });

    expect(result).toHaveLength(2);
    expect(result[0].unlockedAt).not.toBeNull();
    expect(result[1].unlockedAt).toBeNull();
  });
});
