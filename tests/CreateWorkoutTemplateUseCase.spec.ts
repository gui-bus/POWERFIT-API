import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { CreateWorkoutTemplate } from "../src/modules/workout/use-cases/CreateWorkoutTemplate.js";
import { WeekDay } from "../src/generated/prisma/enums.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutTemplate: {
      create: vi.fn(),
    },
  },
}));

describe("CreateWorkoutTemplate Use Case", () => {
  it("should create a workout template with days and exercises", async () => {
    const dto = {
      name: "Test Template",
      days: [
        {
          name: "Day 1",
          weekDay: WeekDay.MONDAY,
          isRestDay: false,
          estimatedDurationInSeconds: 3600,
          exercises: [{ order: 0, name: "Ex 1", sets: 3, reps: 10, restTimeInSeconds: 60 }],
        },
      ],
    };

    (prisma.workoutTemplate.create as any).mockResolvedValue({ id: "t1", name: "Test Template" });

    const createWorkoutTemplate = new CreateWorkoutTemplate();
    const result = await createWorkoutTemplate.execute(dto);

    expect(prisma.workoutTemplate.create).toHaveBeenCalled();
    expect(result.id).toBe("t1");
  });
});
