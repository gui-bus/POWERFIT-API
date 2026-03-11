import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  id: string;
  exerciseName: string;
  weightInGrams: number;
  reps: number;
  achievedAt: string;
}

export class GetPersonalRecords {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    const records = await prisma.personalRecord.findMany({
      where: { userId: dto.userId },
      distinct: ["exerciseName"],
      orderBy: {
        weightInGrams: "desc",
      },
    });

    return records.map((r) => ({
      id: r.id,
      exerciseName: r.exerciseName,
      weightInGrams: r.weightInGrams,
      reps: r.reps,
      achievedAt: r.achievedAt.toISOString(),
    }));
  }
}
