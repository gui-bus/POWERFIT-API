import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { UpsertUserTrainData } from "../src/useCases/UpsertUserTrainData.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    userTrainData: {
      upsert: vi.fn(),
    },
  },
}));

describe("UpsertUserTrainData Use Case", () => {
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

    const upsertTrainData = new UpsertUserTrainData();
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
