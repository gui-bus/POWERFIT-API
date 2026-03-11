import {
  ChallengeStatus,
  ChallengeType,
} from "../../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";
import { ensureInitialChallenges } from "../../../lib/gamification.js";

interface InputDto {
  userId: string;
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
}

export class GetChallenges {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto[]> {
    await ensureInitialChallenges(this.prisma);

    const challenges = await this.prisma.challenge.findMany({
      include: {
        participants: {
          where: { userId: dto.userId },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return challenges.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      status: c.status,
      startDate: c.startDate ? c.startDate.toISOString() : null,
      endDate: c.endDate ? c.endDate.toISOString() : null,
      xpReward: c.xpReward,
      participantsCount: c._count.participants,
      isJoined: c.participants.length > 0,
    }));
  }
}
