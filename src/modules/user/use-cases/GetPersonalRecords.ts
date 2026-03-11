import { PrismaClient } from "../../../lib/db.js";

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
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto[]> {
    const records = await this.prisma.personalRecord.findMany({
      where: { userId: dto.userId },
      distinct: ["exerciseName"],
      orderBy: {
        weightInGrams: "desc",
      },
    });

    return records.map((r: any) => ({
      id: r.id,
      exerciseName: r.exerciseName,
      weightInGrams: r.weightInGrams,
      reps: r.reps,
      achievedAt: r.achievedAt.toISOString(),
    }));
  }
}
