import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  id: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
  loggedAt: string;
}

export class GetBodyProgressHistory {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    const logs = await prisma.bodyProgressLog.findMany({
      where: { userId: dto.userId },
      orderBy: { loggedAt: "asc" },
    });

    return logs.map((log) => ({
      id: log.id,
      weightInGrams: log.weightInGrams,
      heightInCentimeters: log.heightInCentimeters,
      age: log.age,
      bodyFatPercentage: log.bodyFatPercentage,
      loggedAt: log.loggedAt.toISOString(),
    }));
  }
}
