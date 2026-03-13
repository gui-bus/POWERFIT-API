import { prisma } from "../../../lib/db.js";

interface InputDto {
  name: string;
  description?: string;
  muscleGroup: string;
  equipment?: string;
  instructions?: string;
  imageUrl?: string;
  videoUrl?: string;
  difficulty?: string;
}

interface OutputDto {
  id: string;
  name: string;
}

export class CreateExercise {
  async execute(dto: InputDto): Promise<OutputDto> {
    const exercise = await prisma.exercise.create({
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

    return {
      id: exercise.id,
      name: exercise.name,
    };
  }
}
