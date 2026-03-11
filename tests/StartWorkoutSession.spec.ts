import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { StartWorkoutSession } from "../src/modules/workout/use-cases/StartWorkoutSession.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutPlan: { findUnique: vi.fn() },
    workoutSession: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

describe("StartWorkoutSession Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const dto = {
    userId: "user-1",
    workoutPlanId: "plan-1",
    workoutDayId: "day-1",
  };

  it("should start a new session if all conditions are met", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
      isActive: true,
      workoutDays: [{ id: "day-1" }],
    });
    (prisma.workoutSession.findFirst as any).mockResolvedValue(null);
    (prisma.workoutSession.create as any).mockResolvedValue({
      id: "sess-1",
      workoutDayId: "day-1",
      startedAt: new Date(),
      completedAt: null,
    });

    const startSession = new StartWorkoutSession(prisma as any);
    const result = await startSession.execute(dto);

    expect(prisma.workoutSession.create).toHaveBeenCalled();
    expect(result.id).toBe("sess-1");
  });

  it("should throw WorkoutPlanNotActiveError if plan is inactive", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
      isActive: false,
      workoutDays: [{ id: "day-1" }],
    });

    const startSession = new StartWorkoutSession(prisma as any);
    await expect(startSession.execute(dto)).rejects.toThrow(
      WorkoutPlanNotActiveError,
    );
  });

  it("should throw SessionAlreadyStartedError if there is an open session", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
      isActive: true,
      workoutDays: [{ id: "day-1" }],
    });
    (prisma.workoutSession.findFirst as any).mockResolvedValue({
      id: "active-sess",
    });

    const startSession = new StartWorkoutSession(prisma as any);
    await expect(startSession.execute(dto)).rejects.toThrow(
      SessionAlreadyStartedError,
    );
  });
});
