import { describe, expect, it, vi } from "vitest";
import { ChallengeGoal, ChallengeStatus, ChallengeType, NotificationType } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/db.js";
import { CreateChallenge } from "../src/modules/gamification/use-cases/CreateChallenge.js";
import { createAndEmitNotification } from "../src/lib/notifications.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    challenge: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/notifications.js", () => ({
  createAndEmitNotification: vi.fn(),
}));

describe("CreateChallenge Use Case", () => {
  it("should create a friend duel with a non-uuid user id", async () => {
    const creatorId = "user-creator-123";
    const opponentId = "oFPYRFRbw7DGl83QuNqRtoBq81fAmNYJ";
    const dto = {
      userId: creatorId,
      name: "30 Days Challenge",
      description: "Let's see who trains more",
      opponentId,
      xpReward: 100,
      goalType: ChallengeGoal.WORKOUT_COUNT,
      goalTarget: 10,
    };

    const mockOpponent = { id: opponentId, name: "Opponent" };
    const mockChallenge = {
      id: "challenge-123",
      name: dto.name,
      description: dto.description,
      type: ChallengeType.FRIEND_DUEL,
      status: ChallengeStatus.PENDING,
      startDate: null,
      endDate: null,
      xpReward: dto.xpReward,
      goalType: dto.goalType,
      goalTarget: dto.goalTarget,
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockOpponent);
    (prisma.challenge.create as any).mockResolvedValue(mockChallenge);

    const createChallenge = new CreateChallenge(prisma as any);
    const result = await createChallenge.execute(dto);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: opponentId },
    });

    expect(prisma.challenge.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        targetUserId: opponentId,
      }),
    });

    expect(result.goalType).toBe(ChallengeGoal.WORKOUT_COUNT);
  });
});
