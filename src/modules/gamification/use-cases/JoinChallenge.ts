import { NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";
import { CheckAchievements } from "./CheckAchievements.js";

interface InputDto {
  userId: string;
  challengeId: string;
}

export class JoinChallenge {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: dto.challengeId },
    });

    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    if (challenge.status !== "ACTIVE" && challenge.status !== "PENDING") {
      throw new Error("Challenge is not open for joining");
    }

    const existingParticipant = await this.prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId: dto.challengeId,
          userId: dto.userId,
        },
      },
    });

    if (existingParticipant) {
      throw new Error("You are already participating in this challenge");
    }

    await this.prisma.challengeParticipant.create({
      data: {
        challengeId: dto.challengeId,
        userId: dto.userId,
      },
    });

    const checkAchievements = new CheckAchievements(this.prisma);
    await checkAchievements.execute({ userId: dto.userId });
  }
}
