import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  workoutExerciseId: string;
}

interface OutputDto {
  exerciseId: string;
  lastSets: Array<{
    id: string;
    sessionId: string;
    workoutExerciseId: string;
    setIndex: number;
    weightInGrams: number;
    reps: number;
    createdAt: string;
  }>;
}

export class GetWorkoutExerciseHistory {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto | null> {
    const lastSessionWithSets = await this.prisma.workoutSession.findFirst({
      where: {
        workoutDay: { workoutPlan: { userId: dto.userId } },
        sets: { some: { workoutExerciseId: dto.workoutExerciseId } },
      },
      orderBy: { createdAt: "desc" },
      include: {
        sets: {
          where: { workoutExerciseId: dto.workoutExerciseId },
          orderBy: { setIndex: "asc" },
        },
      },
    });

    if (!lastSessionWithSets) return null;

    return {
      exerciseId: dto.workoutExerciseId,
      lastSets: lastSessionWithSets.sets.map((s: any) => ({
        id: s.id,
        sessionId: s.sessionId,
        workoutExerciseId: s.workoutExerciseId,
        setIndex: s.setIndex,
        weightInGrams: s.weightInGrams,
        reps: s.reps,
        createdAt: s.createdAt.toISOString(),
      })),
    };
  }
}
