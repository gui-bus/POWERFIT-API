import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  challengeId: string;
}

export class JoinChallenge {
  async execute(dto: InputDto): Promise<void> {
    const challenge = await prisma.challenge.findUnique({
      where: { id: dto.challengeId },
    });

    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    if (challenge.status !== "ACTIVE" && challenge.status !== "PENDING") {
      throw new Error("Challenge is not open for joining");
    }

    const existingParticipant = await prisma.challengeParticipant.findUnique({
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

    await prisma.challengeParticipant.create({
      data: {
        challengeId: dto.challengeId,
        userId: dto.userId,
      },
    });
  }
}
