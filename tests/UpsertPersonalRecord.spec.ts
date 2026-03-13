import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { UpsertPersonalRecord } from "../src/modules/user/use-cases/UpsertPersonalRecord.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    personalRecord: { findFirst: vi.fn(), create: vi.fn() },
    friendship: { findMany: vi.fn() },
    notification: { create: vi.fn(), createMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
    achievement: { count: vi.fn(), findMany: vi.fn() },
    userAchievement: { findMany: vi.fn(), create: vi.fn() },
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

describe("UpsertPersonalRecord Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.achievement.findMany as any).mockResolvedValue([]);
    (prisma.userAchievement.findMany as any).mockResolvedValue([]);
  });

  it("should create record and notify friends if weight is higher", async () => {
    const userId = "user-1";
    const dto = {
      userId,
      exerciseName: "Supino",
      weightInGrams: 100000,
      reps: 10,
    };

    (prisma.personalRecord.findFirst as any).mockResolvedValue({
      weightInGrams: 80000,
    });
    (prisma.friendship.findMany as any).mockResolvedValue([
      { userId, friendId: "friend-1" },
    ]);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: userId,
      xp: 0,
      level: 1,
    });

    const upsertPR = new UpsertPersonalRecord(prisma as any);
    await upsertPR.execute(dto);

    expect(prisma.personalRecord.create).toHaveBeenCalled();
    expect(prisma.notification.create).toHaveBeenCalled();
  });

  it("should do nothing if new weight is lower than existing record", async () => {
    const userId = "user-1";
    const dto = {
      userId,
      exerciseName: "Supino",
      weightInGrams: 70000,
      reps: 10,
    };

    (prisma.personalRecord.findFirst as any).mockResolvedValue({
      weightInGrams: 80000,
    });

    const upsertPR = new UpsertPersonalRecord(prisma as any);
    await upsertPR.execute(dto);

    expect(prisma.personalRecord.create).not.toHaveBeenCalled();
  });
});
