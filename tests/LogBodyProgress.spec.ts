import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { LogBodyProgress } from "../src/useCases/LogBodyProgress.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    bodyProgressLog: { create: vi.fn() },
    userTrainData: { upsert: vi.fn() },
  },
}));

describe("LogBodyProgress Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a history log and upsert current train data", async () => {
    const userId = "user-1";
    const dto = {
      userId,
      weightInGrams: 75000,
      heightInCentimeters: 175,
      age: 25,
      bodyFatPercentage: 0.15,
    };

    const logBodyProgress = new LogBodyProgress();
    await logBodyProgress.execute(dto);

    expect(prisma.bodyProgressLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId, weightInGrams: 75000 }),
    });
    expect(prisma.userTrainData.upsert).toHaveBeenCalledWith({
      where: { userId },
      create: expect.objectContaining({ weightInGrams: 75000 }),
      update: expect.objectContaining({ weightInGrams: 75000 }),
    });
  });
});
