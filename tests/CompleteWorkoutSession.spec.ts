import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ForbiddenError,
  SessionAlreadyCompletedError,
} from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { CompleteWorkoutSession } from "../src/modules/workout/use-cases/CompleteWorkoutSession.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    workoutPlan: { findUnique: vi.fn() },
    workoutDay: { findUnique: vi.fn() },
    workoutSession: { findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
    activity: { create: vi.fn() },
    notification: { create: vi.fn(), createMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
    achievement: {
      count: vi.fn().mockResolvedValue(10),
      findMany: vi.fn().mockResolvedValue([]),
    },
    userAchievement: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
    challenge: { findMany: vi.fn().mockResolvedValue([]) },
    challengeParticipant: { update: vi.fn() },
  },
}));

vi.mock("../src/lib/gamification.js", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    ensureInitialAchievements: vi.fn(),
  };
});

vi.mock("../src/lib/events.js", () => ({
  notificationEvents: { emit: vi.fn() },
}));

describe("CompleteWorkoutSession Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const dto = {
    userId: "user-1",
    workoutPlanId: "plan-1",
    workoutDayId: "day-1",
    sessionId: "session-1",
  };

  it("should complete a workout session and grant XP", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
    });
    (prisma.workoutDay.findUnique as any).mockResolvedValue({
      id: "day-1",
    });
    (prisma.workoutSession.findUnique as any).mockResolvedValue({
      id: "session-1",
      completedAt: null,
    });
    (prisma.workoutSession.update as any).mockResolvedValue({
      id: "session-1",
      workoutDayId: "day-1",
      startedAt: new Date(),
      completedAt: new Date(),
    });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user-1",
      xp: 0,
      level: 1,
    });
    (prisma.xpTransaction.findFirst as any).mockResolvedValue(null);

    const completeWorkoutSession = new CompleteWorkoutSession(prisma as any);
    const result = await completeWorkoutSession.execute(dto);

    expect(prisma.workoutSession.update).toHaveBeenCalled();
    expect(prisma.activity.create).toHaveBeenCalled();
    expect(result.id).toBe("session-1");
  });

  it("should throw ForbiddenError if user does not own the plan", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: "plan-1",
      userId: "other-user",
    });

    const completeWorkoutSession = new CompleteWorkoutSession(prisma as any);
    await expect(completeWorkoutSession.execute(dto)).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("should throw SessionAlreadyCompletedError if session is already done", async () => {
    (prisma.workoutPlan.findUnique as any).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
    });
    (prisma.workoutDay.findUnique as any).mockResolvedValue({
      id: "day-1",
    });
    (prisma.workoutSession.findUnique as any).mockResolvedValue({
      id: "session-1",
      completedAt: new Date(),
    });

    const completeWorkoutSession = new CompleteWorkoutSession(prisma as any);
    await expect(completeWorkoutSession.execute(dto)).rejects.toThrow(
      SessionAlreadyCompletedError,
    );
  });
});
