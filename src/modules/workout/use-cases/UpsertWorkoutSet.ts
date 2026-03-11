import { NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  sessionId: string;
  workoutExerciseId: string;
  setIndex: number;
  weightInGrams: number;
  reps: number;
}

export class UpsertWorkoutSet {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: dto.sessionId },
      include: { workoutDay: { include: { workoutPlan: true } } },
    });

    if (!session || session.workoutDay.workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout session not found");
    }

    if (session.completedAt) {
      throw new Error("Cannot modify sets of a completed session");
    }

    const existingSet = await this.prisma.workoutSet.findFirst({
      where: {
        sessionId: dto.sessionId,
        workoutExerciseId: dto.workoutExerciseId,
        setIndex: dto.setIndex,
      },
    });

    if (existingSet) {
      await this.prisma.workoutSet.update({
        where: { id: existingSet.id },
        data: {
          weightInGrams: dto.weightInGrams,
          reps: dto.reps,
        },
      });
    } else {
      await this.prisma.workoutSet.create({
        data: {
          sessionId: dto.sessionId,
          workoutExerciseId: dto.workoutExerciseId,
          setIndex: dto.setIndex,
          weightInGrams: dto.weightInGrams,
          reps: dto.reps,
        },
      });
    }
  }
}
