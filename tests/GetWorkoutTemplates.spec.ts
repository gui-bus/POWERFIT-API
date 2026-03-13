import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetWorkoutTemplates } from "../src/modules/workout/use-cases/GetWorkoutTemplates.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutTemplate: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetWorkoutTemplates Use Case", () => {
  it("should return a list of workout templates", async () => {
    const mockTemplates = [
      {
        id: "t1",
        name: "Full Body",
        days: [
          {
            name: "Day 1",
            weekDay: "MONDAY",
            isRestDay: false,
            exercises: [{ name: "Ex 1", order: 0, sets: 3, reps: 10, restTimeInSeconds: 60 }],
          },
        ],
      },
    ];

    (prisma.workoutTemplate.findMany as any).mockResolvedValue(mockTemplates);

    const getWorkoutTemplates = new GetWorkoutTemplates();
    const result = await getWorkoutTemplates.execute({});

    expect(prisma.workoutTemplate.findMany).toHaveBeenCalled();
    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].name).toBe("Full Body");
  });
});
