import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GrantXp } from "../src/modules/gamification/use-cases/GrantXp.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
    notification: { create: vi.fn() },
    challenge: { findMany: vi.fn().mockResolvedValue([]) },
    challengeParticipant: { update: vi.fn() },
  },
}));

describe("GrantXp Use Case", () => {
  it("should correctly increment user XP", async () => {
    const mockUser = { id: "user-1", xp: 100, level: 1 };

    const mockTx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(mockUser),
        update: vi.fn().mockResolvedValue({ ...mockUser, xp: 150 }),
      },
      xpTransaction: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      notification: {
        create: vi.fn().mockResolvedValue({}),
      },
      challenge: { findMany: vi.fn().mockResolvedValue([]) },
      challengeParticipant: { update: vi.fn() },
    };

    const grantXp = new GrantXp(prisma as any);
    await grantXp.execute(
      { userId: "user-1", amount: 50, reason: "WORKOUT_COMPLETED" },
      mockTx,
    );

    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { xp: 150, level: 1 },
    });
  });

  it("should level up when enough XP is gained", async () => {
    const mockUser = { id: "user-1", xp: 480, level: 1 };

    const mockTx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(mockUser),
        update: vi.fn().mockResolvedValue({ ...mockUser, xp: 530, level: 2 }),
      },
      xpTransaction: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      notification: {
        create: vi.fn().mockResolvedValue({}),
      },
      challenge: { findMany: vi.fn().mockResolvedValue([]) },
      challengeParticipant: { update: vi.fn() },
    };

    const grantXp = new GrantXp(prisma as any);
    await grantXp.execute(
      { userId: "user-1", amount: 50, reason: "WORKOUT_COMPLETED" },
      mockTx,
    );

    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { xp: 530, level: 2 },
    });

    expect(mockTx.notification.create).toHaveBeenCalled();
  });

  it("should not grant XP twice if relatedId is provided", async () => {
    const mockTx = {
      xpTransaction: {
        findFirst: vi.fn().mockResolvedValue({ id: "existing-tx" }),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    const grantXp = new GrantXp(prisma as any);
    await grantXp.execute(
      {
        userId: "user-1",
        amount: 50,
        reason: "POWERUP_GIVEN",
        relatedId: "activity-1",
      },
      mockTx,
    );

    expect(mockTx.user.findUnique).not.toHaveBeenCalled();
  });
});
