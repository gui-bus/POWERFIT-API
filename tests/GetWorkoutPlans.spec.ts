import { describe, expect, it, vi, beforeEach } from "vitest";
import { GetWorkoutPlans } from "../src/useCases/GetWorkoutPlans.js";
import { prisma } from "../src/lib/db.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutPlan: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetWorkoutPlans Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all workout plans for a user", async () => {
    const userId = "user-1";
    (prisma.workoutPlan.findMany as any).mockResolvedValue([
      { id: "plan-1", name: "Plan A", isActive: true, workoutDays: [] },
      { id: "plan-2", name: "Plan B", isActive: false, workoutDays: [] },
    ]);

    const getPlans = new GetWorkoutPlans();
    const result = await getPlans.execute({ userId });

    expect(result).toHaveLength(2);
    expect(result[0].isActive).toBe(true);
  });
});
