import { NotFoundError } from "../../../errors/index.js";
import { ChallengeGoal, ChallengeStatus, ChallengeType, NotificationType } from "../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";
import { createAndEmitNotification } from "../../../lib/notifications.js";

interface InputDto {
  userId: string;
  name: string;
  description: string;
  opponentId: string;
  startDate?: string;
  endDate?: string;
  xpReward?: number;
  goalType: ChallengeGoal;
  goalTarget: number;
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
  goalType: ChallengeGoal | null;
  goalTarget: number | null;
}

export class CreateChallenge {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const opponent = await this.prisma.user.findUnique({
      where: { id: dto.opponentId },
    });

    if (!opponent) {
      throw new NotFoundError("Opponent not found");
    }

    if (dto.userId === dto.opponentId) {
      throw new Error("You cannot challenge yourself");
    }

    const challenge = await this.prisma.challenge.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: ChallengeType.FRIEND_DUEL,
        status: ChallengeStatus.PENDING,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        creatorId: dto.userId,
        targetUserId: dto.opponentId,
        xpReward: dto.xpReward || 50,
        goalType: dto.goalType,
        goalTarget: dto.goalTarget,
        participants: {
          create: {
            userId: dto.userId,
          },
        },
      },
    });

    await createAndEmitNotification({
      recipientId: dto.opponentId,
      senderId: dto.userId,
      type: NotificationType.CHALLENGE_INVITE,
      challengeId: challenge.id,
      content: `You have been challenged to a duel: ${challenge.name}`,
    });

    return {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      status: challenge.status,
      startDate: challenge.startDate ? challenge.startDate.toISOString() : null,
      endDate: challenge.endDate ? challenge.endDate.toISOString() : null,
      xpReward: challenge.xpReward,
      goalType: challenge.goalType,
      goalTarget: challenge.goalTarget,
    };
  }
}
