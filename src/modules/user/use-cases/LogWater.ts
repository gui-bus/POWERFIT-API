import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  amountInMl: number;
}

interface OutputDto {
  id: string;
  amountInMl: number;
  loggedAt: Date;
}

export class LogWater {
  async execute(dto: InputDto): Promise<OutputDto> {
    const log = await prisma.waterLog.create({
      data: {
        userId: dto.userId,
        amountInMl: dto.amountInMl,
      },
    });

    return {
      id: log.id,
      amountInMl: log.amountInMl,
      loggedAt: log.loggedAt,
    };
  }
}
