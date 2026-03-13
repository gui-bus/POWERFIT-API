import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  exerciseId: string;
}

interface OutputDto {
  exerciseId: string;
  isFavorite: boolean;
}

export class ToggleFavoriteExercise {
  async execute(dto: InputDto): Promise<OutputDto> {
    let exercise = await prisma.exercise.findUnique({
      where: { id: dto.exerciseId },
    });

    if (!exercise) {
      const workoutExercise = await prisma.workoutExercise.findUnique({
        where: { id: dto.exerciseId },
      });

      if (workoutExercise) {
        exercise = await prisma.exercise.findFirst({
          where: { name: { equals: workoutExercise.name, mode: "insensitive" } },
        });
      }
    }

    if (!exercise) {
      throw new AppError("Exercise not found", "NOT_FOUND", 404);
    }

    const exerciseId = exercise.id;

    const userExercise = await prisma.userExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId: dto.userId,
          exerciseId,
        },
      },
    });

    if (userExercise) {
      const updated = await prisma.userExercise.update({
        where: { id: userExercise.id },
        data: { isFavorite: !userExercise.isFavorite },
      });
      return { exerciseId, isFavorite: updated.isFavorite };
    }

    const created = await prisma.userExercise.create({
      data: {
        userId: dto.userId,
        exerciseId,
        isFavorite: true,
      },
    });

    return { exerciseId, isFavorite: created.isFavorite };
  }
}
