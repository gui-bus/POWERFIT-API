import { WeekDay } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  category?: string;
  difficulty?: string;
  query?: string;
}

interface OutputDto {
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    difficulty: string | null;
    imageUrl: string | null;
    days: Array<{
      name: string;
      weekDay: WeekDay;
      isRestDay: boolean;
      estimatedDurationInSeconds: number;
      exercises: Array<{
        name: string;
        order: number;
        sets: number;
        reps: number;
        restTimeInSeconds: number;
      }>;
    }>;
  }>;
}

export class GetWorkoutTemplates {
  async execute(dto: InputDto): Promise<OutputDto> {
    const translateTerm = (term?: string) => {
      if (!term) return term;
      const map: Record<string, string> = {
        beginner: "Iniciante",
        intermediate: "Intermediário",
        advanced: "Avançado",
        "muscle gain": "Ganho de Massa",
        "weight loss": "Emagrecimento",
      };
      return map[term.toLowerCase()] || term;
    };

    const category = translateTerm(dto.category);
    const difficulty = translateTerm(dto.difficulty);

    const templates = await prisma.workoutTemplate.findMany({
      where: {
        AND: [
          category ? { category: { contains: category, mode: "insensitive" } } : {},
          difficulty ? { difficulty: { contains: difficulty, mode: "insensitive" } } : {},
          dto.query ? {
            OR: [
              { name: { contains: dto.query, mode: "insensitive" } },
              { description: { contains: dto.query, mode: "insensitive" } }
            ]
          } : {},
        ],
      },
      include: {
        days: {
          include: { exercises: { orderBy: { order: "asc" } } },
          orderBy: { weekDay: "asc" },
        },
      },
    });

    return {
      templates: templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        imageUrl: template.imageUrl,
        days: template.days.map((day) => ({
          name: day.name,
          weekDay: day.weekDay,
          isRestDay: day.isRestDay,
          estimatedDurationInSeconds: day.estimatedDurationInSeconds,
          exercises: day.exercises.map((ex) => ({
            name: ex.name,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            restTimeInSeconds: ex.restTimeInSeconds,
          })),
        })),
      })),
    };
  }
}
