import { ChallengeGoal, ChallengeStatus } from "../../../generated/prisma/enums.js";
import { PrismaClient, PrismaTransaction } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  goalType: ChallengeGoal;
  increment: number;
}

export class UpdateChallengeProgress {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto, tx?: PrismaTransaction): Promise<void> {
    const client = tx || this.prisma;

    const activeChallenges = await client.challenge.findMany({
      where: {
        status: ChallengeStatus.ACTIVE,
        goalType: dto.goalType,
        participants: {
          some: {
            userId: dto.userId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    for (const challenge of activeChallenges) {
      const participant = challenge.participants.find((p) => p.userId === dto.userId);

      if (!participant) continue;

      const newScore = participant.score + dto.increment;

      await client.challengeParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          score: newScore,
        },
      });

      // Check if goal reached
      if (challenge.goalTarget && newScore >= challenge.goalTarget) {
        // Mark as completed and set winner
        await client.challenge.update({
          where: { id: challenge.id },
          data: {
            status: ChallengeStatus.COMPLETED,
          },
        });

        await client.challengeParticipant.update({
          where: { id: participant.id },
          data: {
            hasWon: true,
          },
        });
        
        // Note: In a real scenario, you'd also award the xpReward here.
      }
    }
  }
}
