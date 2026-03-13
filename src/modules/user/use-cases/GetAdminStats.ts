import { prisma } from "../../../lib/db.js";

interface OutputDto {
  totalUsers: number;
  bannedUsers: number;
  totalActivities: number;
  totalWorkoutPlans: number;
  totalExercises: number;
}

export class GetAdminStats {
  async execute(): Promise<OutputDto> {
    const [
      totalUsers,
      bannedUsers,
      totalActivities,
      totalWorkoutPlans,
      totalExercises,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.activity.count(),
      prisma.workoutPlan.count(),
      prisma.exercise.count(),
    ]);

    return {
      totalUsers,
      bannedUsers,
      totalActivities,
      totalWorkoutPlans,
      totalExercises,
    };
  }
}
