import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetXpHistory } from "../src/useCases/GetXpHistory.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    xpTransaction: { findMany: vi.fn() },
  },
}));

describe("GetXpHistory Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return xp history transactions", async () => {
    const userId = "user-1";
    (prisma.xpTransaction.findMany as any).mockResolvedValue([
      {
        id: "tx-1",
        amount: 100,
        reason: "WORKOUT_COMPLETED",
        createdAt: new Date(),
      },
    ]);

    const getXpHistory = new GetXpHistory();
    const result = await getXpHistory.execute({ userId });

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(100);
  });
});
