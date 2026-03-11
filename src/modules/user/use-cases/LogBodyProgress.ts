import { PrismaClient } from "../../../lib/db.js";
import { CheckAchievements } from "../../gamification/use-cases/CheckAchievements.js";

interface InputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

export class LogBodyProgress {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    await this.prisma.$transaction(async (tx: any) => {
      await tx.bodyProgressLog.create({
        data: {
          userId: dto.userId,
          weightInGrams: dto.weightInGrams,
          heightInCentimeters: dto.heightInCentimeters,
          age: dto.age,
          bodyFatPercentage: dto.bodyFatPercentage,
        },
      });

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

    const checkAchievements = new CheckAchievements(this.prisma);
    await checkAchievements.execute({ userId: dto.userId });
  }
}
