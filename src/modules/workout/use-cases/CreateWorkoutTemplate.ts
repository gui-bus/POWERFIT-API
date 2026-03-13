import { WeekDay } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  imageUrl?: string;
  days: Array<{
    name: string;
    weekDay: WeekDay;
    isRestDay: boolean;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

interface OutputDto {
  id: string;
  name: string;
}

export class CreateWorkoutTemplate {
  async execute(dto: InputDto): Promise<OutputDto> {
    const template = await prisma.workoutTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        difficulty: dto.difficulty,
        imageUrl: dto.imageUrl,
        days: {
          create: dto.days.map((day) => ({
            name: day.name,
            weekDay: day.weekDay,
            isRestDay: day.isRestDay,
            estimatedDurationInSeconds: day.estimatedDurationInSeconds,
            exercises: {
              create: day.exercises.map((ex) => ({
                name: ex.name,
                order: ex.order,
                sets: ex.sets,
                reps: ex.reps,
                restTimeInSeconds: ex.restTimeInSeconds,
              })),
            },
          })),
        },
      },
    });

    return {
      id: template.id,
      name: template.name,
    };
  }
}
