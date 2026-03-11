import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetPersonalRecords } from "../src/useCases/GetPersonalRecords.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    personalRecord: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetPersonalRecords Use Case", () => {
  it("should return personal records for a user", async () => {
    const userId = "user-1";
    const mockRecords = [
      {
        id: "pr-1",
        exerciseName: "Supino",
        weightInGrams: 100000,
        reps: 8,
        achievedAt: new Date(),
      },
      {
        id: "pr-2",
        exerciseName: "Agachamento",
        weightInGrams: 120000,
        reps: 10,
        achievedAt: new Date(),
      },
    ];

    (prisma.personalRecord.findMany as any).mockResolvedValue(mockRecords);

    const getPRs = new GetPersonalRecords();
    const result = await getPRs.execute({ userId });

    expect(result).toHaveLength(2);
    expect(result[0].exerciseName).toBe("Supino");
    expect(result[1].exerciseName).toBe("Agachamento");
    expect(prisma.personalRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
        distinct: ["exerciseName"],
      }),
    );
  });
});
