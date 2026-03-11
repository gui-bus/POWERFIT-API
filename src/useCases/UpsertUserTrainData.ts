import { prisma } from "../lib/db.js";
import { CheckAchievements } from "./CheckAchievements.js";

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
  async execute(dto: InputDto): Promise<OutputDto> {
    const userTrainData = await prisma.userTrainData.upsert({
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

    const checkAchievements = new CheckAchievements();
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
