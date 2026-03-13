import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  id: string;
}

export class DeleteExercise {
  async execute(dto: InputDto): Promise<void> {
    const exercise = await prisma.exercise.findUnique({
      where: { id: dto.id },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", "NOT_FOUND", 404);
    }

    await prisma.exercise.delete({
      where: { id: dto.id },
    });
  }
}
