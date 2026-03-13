import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  id: string;
  name?: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  instructions?: string;
  imageUrl?: string;
  videoUrl?: string;
  difficulty?: string;
}

export class UpdateExercise {
  async execute(dto: InputDto): Promise<void> {
    const exercise = await prisma.exercise.findUnique({
      where: { id: dto.id },
    });

    if (!exercise) {
      throw new AppError("Exercise not found", "NOT_FOUND", 404);
    }

    await prisma.exercise.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        description: dto.description,
        muscleGroup: dto.muscleGroup,
        equipment: dto.equipment,
        instructions: dto.instructions,
        imageUrl: dto.imageUrl,
        videoUrl: dto.videoUrl,
        difficulty: dto.difficulty,
      },
    });
  }
}
