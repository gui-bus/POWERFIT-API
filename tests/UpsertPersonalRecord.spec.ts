import { describe, expect, it, vi, beforeEach } from "vitest";
import { UpsertPersonalRecord } from "../src/useCases/UpsertPersonalRecord.js";
import { prisma } from "../src/lib/db.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    personalRecord: { findFirst: vi.fn(), create: vi.fn() },
    friendship: { findMany: vi.fn() },
    notification: { createMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

describe("UpsertPersonalRecord Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create record and notify friends if weight is higher", async () => {
    const userId = "user-1";
    const dto = { userId, exerciseName: "Supino", weightInGrams: 100000, reps: 10 };

    (prisma.personalRecord.findFirst as any).mockResolvedValue({ weightInGrams: 80000 });
    (prisma.friendship.findMany as any).mockResolvedValue([{ userId, friendId: "friend-1" }]);
    (prisma.user.findUnique as any).mockResolvedValue({ id: userId, xp: 0, level: 1 });

    const upsertPR = new UpsertPersonalRecord();
    await upsertPR.execute(dto);

    expect(prisma.personalRecord.create).toHaveBeenCalled();
    expect(prisma.notification.createMany).toHaveBeenCalled();
  });

  it("should do nothing if new weight is lower than existing record", async () => {
    const userId = "user-1";
    const dto = { userId, exerciseName: "Supino", weightInGrams: 70000, reps: 10 };

    (prisma.personalRecord.findFirst as any).mockResolvedValue({ weightInGrams: 80000 });

    const upsertPR = new UpsertPersonalRecord();
    await upsertPR.execute(dto);

    expect(prisma.personalRecord.create).not.toHaveBeenCalled();
  });
});
