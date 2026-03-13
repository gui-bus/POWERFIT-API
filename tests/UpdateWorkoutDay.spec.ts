import { describe, expect, it, vi } from "vitest";

import { WeekDay } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/lib/db.js";
import { UpdateWorkoutDay } from "../src/modules/workout/use-cases/UpdateWorkoutDay.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    workoutDay: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    workoutExercise: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

describe("UpdateWorkoutDay Use Case", () => {
  it("should update a workout day and its exercises", async () => {
    const userId = "u1";
    const planId = "p1";
    const dayId = "d1";
    const dto = {
      userId,
      workoutPlanId: planId,
      workoutDayId: dayId,
      name: "New Day Name",
      weekDay: WeekDay.MONDAY,
      isRestDay: false,
      estimatedDurationInSeconds: 3600,
      exercises: [{ name: "Ex 1", order: 0, sets: 3, reps: 10, restTimeInSeconds: 60 }],
    };

    (prisma.workoutDay.findFirst as any).mockResolvedValue({ id: dayId, workoutPlanId: planId });

    const updateWorkoutDay = new UpdateWorkoutDay();
    await updateWorkoutDay.execute(dto);

    expect(prisma.workoutDay.update).toHaveBeenCalled();
    expect(prisma.workoutExercise.deleteMany).toHaveBeenCalled();
    expect(prisma.workoutExercise.createMany).toHaveBeenCalled();
  });
});
