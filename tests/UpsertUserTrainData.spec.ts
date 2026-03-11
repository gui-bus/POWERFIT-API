import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { UpsertUserTrainData } from "../src/modules/user/use-cases/UpsertUserTrainData.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    userTrainData: {
      upsert: vi.fn(),
    },
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

describe("UpsertUserTrainData Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.achievement.findMany as any).mockResolvedValue([]);
    (prisma.userAchievement.findMany as any).mockResolvedValue([]);
  });

  it("should create or update user train data", async () => {
    const userId = "user-1";
    const dto = {
      userId,
      weightInGrams: 80000,
      heightInCentimeters: 180,
      age: 25,
      bodyFatPercentage: 15,
    };

    (prisma.userTrainData.upsert as any).mockResolvedValue(dto);

    const upsertTrainData = new UpsertUserTrainData(prisma as any);
    const result = await upsertTrainData.execute(dto);

    expect(result.weightInGrams).toBe(80000);
    expect(prisma.userTrainData.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
        create: dto,
        update: {
          weightInGrams: dto.weightInGrams,
          heightInCentimeters: dto.heightInCentimeters,
          age: dto.age,
          bodyFatPercentage: dto.bodyFatPercentage,
        },
      }),
    );
  });
});
