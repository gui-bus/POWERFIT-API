import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { JoinChallenge } from "../src/useCases/JoinChallenge.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    challenge: { findUnique: vi.fn() },
    challengeParticipant: { findUnique: vi.fn(), create: vi.fn() },
    achievement: { count: vi.fn(), findMany: vi.fn() },
    userAchievement: { findMany: vi.fn(), create: vi.fn() },
    workoutSession: { count: vi.fn() },
    friendship: { count: vi.fn() },
    powerup: { count: vi.fn() },
    notification: { create: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
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

describe("JoinChallenge Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.achievement.findMany as any).mockResolvedValue([]);
    (prisma.userAchievement.findMany as any).mockResolvedValue([]);
  });

  it("should join a challenge if it's active and user is not a participant", async () => {
    const userId = "user-1";
    const challengeId = "chal-1";

    (prisma.challenge.findUnique as any).mockResolvedValue({
      id: challengeId,
      status: "ACTIVE",
    });
    (prisma.challengeParticipant.findUnique as any).mockResolvedValue(null);

    const joinChallenge = new JoinChallenge();
    await joinChallenge.execute({ userId, challengeId });

    expect(prisma.challengeParticipant.create).toHaveBeenCalled();
  });

  it("should throw Error if challenge is already completed", async () => {
    const userId = "user-1";
    const challengeId = "chal-1";

    (prisma.challenge.findUnique as any).mockResolvedValue({
      id: challengeId,
      status: "COMPLETED",
    });

    const joinChallenge = new JoinChallenge();
    await expect(
      joinChallenge.execute({ userId, challengeId }),
    ).rejects.toThrow("Challenge is not open for joining");
  });

  it("should throw Error if user is already a participant", async () => {
    const userId = "user-1";
    const challengeId = "chal-1";

    (prisma.challenge.findUnique as any).mockResolvedValue({
      id: challengeId,
      status: "ACTIVE",
    });
    (prisma.challengeParticipant.findUnique as any).mockResolvedValue({
      id: "part-1",
    });

    const joinChallenge = new JoinChallenge();
    await expect(
      joinChallenge.execute({ userId, challengeId }),
    ).rejects.toThrow("You are already participating in this challenge");
  });
});
