import { describe, expect, it, vi } from "vitest";

import { ChallengeGoal, ChallengeStatus } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/db.js";
import { UpdateChallengeProgress } from "../src/modules/gamification/use-cases/UpdateChallengeProgress.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    challenge: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    challengeParticipant: {
      update: vi.fn(),
    },
  },
}));

describe("UpdateChallengeProgress Use Case", () => {
  it("should increment score and not finish if goal not reached", async () => {
    const userId = "u1";
    const goalType = ChallengeGoal.STREAK;
    const increment = 1;
    const mockChallenge = {
      id: "c1",
      goalTarget: 10,
      participants: [{ id: "p1", userId, score: 5 }],
    };

    (prisma.challenge.findMany as any).mockResolvedValue([mockChallenge]);

    const updateChallengeProgress = new UpdateChallengeProgress(prisma as any);
    await updateChallengeProgress.execute({ userId, goalType, increment });

    expect(prisma.challengeParticipant.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { score: 6 },
    });
    expect(prisma.challenge.update).not.toHaveBeenCalled();
  });

  it("should finish challenge and mark winner if goal reached", async () => {
    const userId = "u1";
    const goalType = ChallengeGoal.WORKOUT_COUNT;
    const increment = 1;
    const mockChallenge = {
      id: "c1",
      goalTarget: 10,
      participants: [{ id: "p1", userId, score: 9 }],
    };

    (prisma.challenge.findMany as any).mockResolvedValue([mockChallenge]);

    const updateChallengeProgress = new UpdateChallengeProgress(prisma as any);
    await updateChallengeProgress.execute({ userId, goalType, increment });

    expect(prisma.challengeParticipant.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { score: 10 },
    });
    expect(prisma.challenge.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { status: ChallengeStatus.COMPLETED },
    });
    expect(prisma.challengeParticipant.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { hasWon: true },
    });
  });
});
