import dayjs from "dayjs";
import { describe, expect, it, vi } from "vitest";

import { AppError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { StreakRepair } from "../src/modules/gamification/use-cases/StreakRepair.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    workoutSession: {
      findFirst: vi.fn(),
    },
    xpTransaction: {
      create: vi.fn(),
    },
  },
}));

describe("StreakRepair Use Case", () => {
  it("should repair streak if user has enough XP and needs repair", async () => {
    const userId = "u1";
    const mockUser = { id: userId, xp: 1000 };
    const mockSession = { completedAt: dayjs().subtract(3, "day").toDate() };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.workoutSession.findFirst as any).mockResolvedValue(mockSession);
    (prisma.user.update as any).mockResolvedValue({ ...mockUser, xp: 500 });

    const streakRepair = new StreakRepair();
    const result = await streakRepair.execute({ userId });

    expect(prisma.xpTransaction.create).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalled();
    expect(result.newXp).toBe(500);
  });

  it("should throw error if insufficient XP", async () => {
    const userId = "u1";
    (prisma.user.findUnique as any).mockResolvedValue({ id: userId, xp: 100 });

    const streakRepair = new StreakRepair();
    await expect(streakRepair.execute({ userId })).rejects.toThrow(AppError);
  });

  it("should throw error if streak is still active", async () => {
    const userId = "u1";
    const mockUser = { id: userId, xp: 1000 };
    const mockSession = { completedAt: dayjs().subtract(12, "hour").toDate() };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.workoutSession.findFirst as any).mockResolvedValue(mockSession);

    const streakRepair = new StreakRepair();
    await expect(streakRepair.execute({ userId })).rejects.toThrow(AppError);
  });
});
