import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { CheckAchievements } from "../src/modules/gamification/use-cases/CheckAchievements.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    userAchievement: { findMany: vi.fn(), create: vi.fn() },
    achievement: { findMany: vi.fn(), count: vi.fn().mockResolvedValue(3) },
    workoutSession: { count: vi.fn(), findMany: vi.fn() },
    friendship: { count: vi.fn() },
    powerup: { count: vi.fn() },
    notification: { create: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
    challenge: { findMany: vi.fn().mockResolvedValue([]) },
    challengeParticipant: { update: vi.fn() },
  },
}));

vi.mock("../src/lib/gamification.js", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    ensureInitialAchievements: vi.fn(),
    calculateLevel: vi.fn().mockReturnValue(1),
  };
});

vi.mock("../src/lib/events.js", () => ({
  notificationEvents: { emit: vi.fn() },
}));

describe("CheckAchievements Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should unlock 'Primeiro Passo' when user completes first workout", async () => {
    const userId = "user-1";

    (prisma.userAchievement.findMany as any).mockResolvedValue([]);
    (prisma.achievement.findMany as any).mockResolvedValue([
      { id: "ach-1", name: "Primeiro Passo", xpReward: 100 },
    ]);
    (prisma.workoutSession.count as any).mockResolvedValue(1);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: userId,
      xp: 0,
      level: 1,
    });
    (prisma.xpTransaction.findFirst as any).mockResolvedValue(null);

    const checkAchievements = new CheckAchievements(prisma as any);
    await checkAchievements.execute({ userId });

    expect(prisma.userAchievement.create).toHaveBeenCalledWith({
      data: { userId, achievementId: "ach-1" },
    });
    expect(prisma.notification.create).toHaveBeenCalled();
  });

  it("should not unlock if conditions are not met", async () => {
    const userId = "user-1";

    (prisma.userAchievement.findMany as any).mockResolvedValue([]);
    (prisma.achievement.findMany as any).mockResolvedValue([
      { id: "ach-1", name: "Primeiro Passo", xpReward: 100 },
    ]);
    (prisma.workoutSession.count as any).mockResolvedValue(0);

    const checkAchievements = new CheckAchievements(prisma as any);
    await checkAchievements.execute({ userId });

    expect(prisma.userAchievement.create).not.toHaveBeenCalled();
  });
});
