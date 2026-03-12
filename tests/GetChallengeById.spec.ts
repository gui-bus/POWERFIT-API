import { describe, expect, it, vi } from "vitest";
import { ChallengeType, ChallengeStatus, ChallengeGoal } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/db.js";
import { GetChallengeById } from "../src/modules/gamification/use-cases/GetChallengeById.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    challenge: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GetChallengeById Use Case", () => {
  it("should return challenge details with participant progress", async () => {
    const userId = "user-1";
    const challengeId = "challenge-123";

    const mockChallenge = {
      id: challengeId,
      name: "Duel 1",
      description: "Description",
      type: ChallengeType.FRIEND_DUEL,
      status: ChallengeStatus.ACTIVE,
      startDate: new Date(),
      endDate: null,
      xpReward: 100,
      goalType: ChallengeGoal.WORKOUT_COUNT,
      goalTarget: 10,
      creatorId: userId,
      targetUserId: "user-2",
      participants: [
        {
          userId: "user-1",
          score: 5,
          hasWon: false,
          user: { name: "User 1" },
        },
        {
          userId: "user-2",
          score: 3,
          hasWon: false,
          user: { name: "User 2" },
        },
      ],
      _count: { participants: 2 },
    };

    (prisma.challenge.findUnique as any).mockResolvedValue(mockChallenge);

    const getChallengeById = new GetChallengeById(prisma as any);
    const result = await getChallengeById.execute({ userId, challengeId });

    expect(result.id).toBe(challengeId);
    expect(result.participants).toHaveLength(2);
    expect(result.participants[0].userName).toBe("User 1");
    expect(result.participants[0].score).toBe(5);
    expect(result.isJoined).toBe(true);
  });

  it("should throw error if challenge not found", async () => {
    (prisma.challenge.findUnique as any).mockResolvedValue(null);

    const getChallengeById = new GetChallengeById(prisma as any);
    await expect(getChallengeById.execute({ userId: "u1", challengeId: "c1" })).rejects.toThrow("Challenge not found");
  });

  it("should throw error if user is not involved in a private duel", async () => {
    const mockChallenge = {
      id: "c1",
      type: ChallengeType.FRIEND_DUEL,
      creatorId: "other-1",
      targetUserId: "other-2",
      participants: [],
    };

    (prisma.challenge.findUnique as any).mockResolvedValue(mockChallenge);

    const getChallengeById = new GetChallengeById(prisma as any);
    await expect(getChallengeById.execute({ userId: "hacker", challengeId: "c1" })).rejects.toThrow("You don't have permission to see this challenge");
  });
});
