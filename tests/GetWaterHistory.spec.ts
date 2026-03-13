import dayjs from "dayjs";
import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetWaterHistory } from "../src/modules/user/use-cases/GetWaterHistory.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    waterLog: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetWaterHistory Use Case", () => {
  it("should return water history and total for a specific date", async () => {
    const userId = "user-123";
    const date = "2023-10-27";
    const mockLogs = [
      { id: "1", amountInMl: 250, loggedAt: dayjs(date).set("hour", 10).toDate() },
      { id: "2", amountInMl: 500, loggedAt: dayjs(date).set("hour", 14).toDate() },
    ];

    (prisma.waterLog.findMany as any).mockResolvedValue(mockLogs);

    const getWaterHistory = new GetWaterHistory();
    const result = await getWaterHistory.execute({ userId, date });

    expect(prisma.waterLog.findMany).toHaveBeenCalledWith({
      where: {
        userId,
        loggedAt: {
          gte: dayjs(date).startOf("day").toDate(),
          lte: dayjs(date).endOf("day").toDate(),
        },
      },
      orderBy: { loggedAt: "desc" },
    });

    expect(result.totalInMl).toBe(750);
    expect(result.logs).toHaveLength(2);
    expect(result.logs[0].amountInMl).toBe(250);
    expect(result.logs[1].amountInMl).toBe(500);
  });
});
