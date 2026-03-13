import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  muscleGroup?: string;
  query?: string;
  favoritesOnly?: boolean;
}

interface OutputDto {
  exercises: Array<{
    id: string;
    name: string;
    description: string | null;
    muscleGroup: string;
    equipment: string | null;
    instructions: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    difficulty: string | null;
    isFavorite: boolean;
  }>;
}

export class GetExercises {
  async execute(dto: InputDto): Promise<OutputDto> {
    const exercises = await prisma.exercise.findMany({
      where: {
        AND: [
          dto.muscleGroup ? { muscleGroup: dto.muscleGroup } : {},
          dto.query ? { name: { contains: dto.query, mode: "insensitive" } } : {},
          dto.favoritesOnly ? {
            userFavorites: {
              some: { userId: dto.userId, isFavorite: true }
            }
          } : {},
        ],
      },
      include: {
        userFavorites: {
          where: { userId: dto.userId }
        }
      },
      orderBy: { name: "asc" },
    });

    return {
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        instructions: ex.instructions,
        imageUrl: ex.imageUrl,
        videoUrl: ex.videoUrl,
        difficulty: ex.difficulty,
        isFavorite: ex.userFavorites[0]?.isFavorite ?? false,
      })),
    };
  }
}
