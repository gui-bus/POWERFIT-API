import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

export class LogBodyProgress {
  async execute(dto: InputDto): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Criar log histórico
      await tx.bodyProgressLog.create({
        data: {
          userId: dto.userId,
          weightInGrams: dto.weightInGrams,
          heightInCentimeters: dto.heightInCentimeters,
          age: dto.age,
          bodyFatPercentage: dto.bodyFatPercentage,
        },
      });

      // 2. Atualizar estado atual (UserTrainData)
      await tx.userTrainData.upsert({
        where: { userId: dto.userId },
        create: {
          userId: dto.userId,
          weightInGrams: dto.weightInGrams,
          heightInCentimeters: dto.heightInCentimeters,
          age: dto.age,
          bodyFatPercentage: dto.bodyFatPercentage,
        },
        update: {
          weightInGrams: dto.weightInGrams,
          heightInCentimeters: dto.heightInCentimeters,
          age: dto.age,
          bodyFatPercentage: dto.bodyFatPercentage,
        },
      });
    });
  }
}
