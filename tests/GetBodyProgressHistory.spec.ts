import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetBodyProgressHistory } from "../src/useCases/GetBodyProgressHistory.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    bodyProgressLog: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetBodyProgressHistory Use Case", () => {
  it("should return body progress history for a user", async () => {
    const userId = "user-1";
    const mockLogs = [
      {
        id: "log-1",
        weightInGrams: 80000,
        heightInCentimeters: 180,
        age: 25,
        bodyFatPercentage: 15.5,
        loggedAt: new Date("2026-01-01"),
      },
      {
        id: "log-2",
        weightInGrams: 78000,
        heightInCentimeters: 180,
        age: 25,
        bodyFatPercentage: 14.2,
        loggedAt: new Date("2026-02-01"),
      },
    ];

    (prisma.bodyProgressLog.findMany as any).mockResolvedValue(mockLogs);

    const getHistory = new GetBodyProgressHistory();
    const result = await getHistory.execute({ userId });

    expect(result).toHaveLength(2);
    expect(result[0].weightInGrams).toBe(80000);
    expect(result[1].weightInGrams).toBe(78000);
    expect(prisma.bodyProgressLog.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { loggedAt: "asc" },
    });
  });
});
