import { PrismaClient } from "../../../lib/db.js";
import { CheckAchievements } from "../../gamification/use-cases/CheckAchievements.js";

interface InputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

interface OutputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

export class UpsertUserTrainData {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const userTrainData = await this.prisma.userTrainData.upsert({
      where: {
        userId: dto.userId,
      },
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

    const checkAchievements = new CheckAchievements(this.prisma);
    await checkAchievements.execute({ userId: dto.userId });

    return {
      userId: userTrainData.userId,
      weightInGrams: userTrainData.weightInGrams,
      heightInCentimeters: userTrainData.heightInCentimeters,
      age: userTrainData.age,
      bodyFatPercentage: userTrainData.bodyFatPercentage,
    };
  }
}
