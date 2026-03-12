import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetChallenges } from "../src/modules/gamification/use-cases/GetChallenges.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    challenge: { findMany: vi.fn() },
  },
}));

vi.mock("../src/lib/gamification.js", () => ({
  ensureInitialChallenges: vi.fn(),
}));

describe("GetChallenges Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return challenges and indicate if user joined", async () => {
    const userId = "user-1";
    (prisma.challenge.findMany as any).mockResolvedValue([
      {
        id: "chal-1",
        name: "Challenge 1",
        description: "Desc",
        type: "COMMUNITY",
        status: "ACTIVE",
        startDate: new Date(),
        endDate: null,
        xpReward: 500,
        participants: [{ userId: "user-1" }],
        _count: { participants: 10 },
      },
    ]);

    const getChallenges = new GetChallenges(prisma as any);
    const result = await getChallenges.execute({ userId });

    expect(prisma.challenge.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: expect.arrayContaining([
          expect.objectContaining({ creatorId: userId }),
          expect.objectContaining({ targetUserId: userId }),
        ]),
      }),
    }));

    expect(result).toHaveLength(1);
    expect(result[0].isJoined).toBe(true);
    expect(result[0].participantsCount).toBe(10);
  });
});
