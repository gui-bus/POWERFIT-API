import { NotFoundError } from "../../../errors/index.js";
import { ChallengeGoal, ChallengeStatus, ChallengeType } from "../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  challengeId: string;
}

interface OutputDto {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  startDate: string | null;
  endDate: string | null;
  xpReward: number;
  participantsCount: number;
  isJoined: boolean;
  goalType: ChallengeGoal | null;
  goalTarget: number | null;
  participants: Array<{
    userId: string;
    userName: string;
    score: number;
    hasWon: boolean;
  }>;
}

export class GetChallengeById {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: dto.challengeId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    const isParticipant = challenge.participants.some(p => p.userId === dto.userId);
    const isInvolved = challenge.type === ChallengeType.GLOBAL || 
                       challenge.creatorId === dto.userId || 
                       challenge.targetUserId === dto.userId || 
                       isParticipant;

    if (!isInvolved) {
      throw new Error("You don't have permission to see this challenge");
    }

    return {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      status: challenge.status,
      startDate: challenge.startDate ? challenge.startDate.toISOString() : null,
      endDate: challenge.endDate ? challenge.endDate.toISOString() : null,
      xpReward: challenge.xpReward,
      participantsCount: challenge._count.participants,
      isJoined: isParticipant,
      goalType: challenge.goalType,
      goalTarget: challenge.goalTarget,
      participants: challenge.participants.map(p => ({
        userId: p.userId,
        userName: p.user.name,
        score: p.score,
        hasWon: p.hasWon,
      })),
    };
  }
}
