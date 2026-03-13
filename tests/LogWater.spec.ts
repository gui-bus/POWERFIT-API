import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { LogWater } from "../src/modules/user/use-cases/LogWater.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    waterLog: {
      create: vi.fn(),
    },
  },
}));

describe("LogWater Use Case", () => {
  it("should create a water log", async () => {
    const userId = "user-123";
    const amountInMl = 500;
    const mockLog = {
      id: "log-id",
      userId,
      amountInMl,
      loggedAt: new Date(),
    };

    (prisma.waterLog.create as any).mockResolvedValue(mockLog);

    const logWater = new LogWater();
    const result = await logWater.execute({ userId, amountInMl });

    expect(prisma.waterLog.create).toHaveBeenCalledWith({
      data: { userId, amountInMl },
    });

    expect(result.id).toBe(mockLog.id);
    expect(result.amountInMl).toBe(amountInMl);
    expect(result.loggedAt).toBe(mockLog.loggedAt);
  });
});
