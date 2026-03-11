import { ForbiddenError, NotFoundError } from "../../../errors/index.js";
import { WeekDay } from "../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
}

interface OutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    id: string;
    weekDay: WeekDay;
    name: string;
    isRestDay: boolean;
    coverImageUrl?: string | null;
    estimatedDurationInSeconds: number;
    exercisesCount: number;
  }>;
}

export class GetWorkoutPlanById {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: {
        id: dto.workoutPlanId,
      },
      include: {
        workoutDays: {
          include: {
            _count: {
              select: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new ForbiddenError(
        "You don't have permission to access this workout plan",
      );
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      workoutDays: workoutPlan.workoutDays.map((day: any) => ({
        id: day.id,
        weekDay: day.weekDay,
        name: day.name,
        isRestDay: day.isRestDay,
        coverImageUrl: day.coverImageUrl,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        exercisesCount: day._count.exercises,
      })),
    };
  }
}
