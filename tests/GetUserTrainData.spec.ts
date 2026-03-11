import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetUserTrainData } from "../src/modules/user/use-cases/GetUserTrainData.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GetUserTrainData Use Case", () => {
  it("should return user train data", async () => {
    const userId = "user-1";
    (prisma.user.findUnique as any).mockResolvedValue({
      id: userId,
      name: "Test User",
      trainData: {
        weightInGrams: 75000,
        heightInCentimeters: 175,
        age: 30,
        bodyFatPercentage: 12.5,
      },
    });

    const getUserTrainData = new GetUserTrainData(prisma as any);
    const result = await getUserTrainData.execute({ userId });

    expect(result).not.toBeNull();
    expect(result?.weightInGrams).toBe(75000);
    expect(result?.userName).toBe("Test User");
  });

  it("should return null if user or train data not found", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const getUserTrainData = new GetUserTrainData(prisma as any);
    const result = await getUserTrainData.execute({ userId: "none" });

    expect(result).toBeNull();
  });
});
