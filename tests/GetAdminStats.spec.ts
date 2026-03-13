import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { GetAdminStats } from "../src/modules/user/use-cases/GetAdminStats.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: { count: vi.fn() },
    activity: { count: vi.fn() },
    workoutPlan: { count: vi.fn() },
    exercise: { count: vi.fn() },
  },
}));

describe("GetAdminStats Use Case", () => {
  it("should return correct system stats", async () => {
    (prisma.user.count as any).mockResolvedValueOnce(100).mockResolvedValueOnce(2);
    (prisma.activity.count as any).mockResolvedValue(500);
    (prisma.workoutPlan.count as any).mockResolvedValue(300);
    (prisma.exercise.count as any).mockResolvedValue(50);

    const getAdminStats = new GetAdminStats();
    const result = await getAdminStats.execute();

    expect(result.totalUsers).toBe(100);
    expect(result.bannedUsers).toBe(2);
    expect(result.totalActivities).toBe(500);
  });
});
