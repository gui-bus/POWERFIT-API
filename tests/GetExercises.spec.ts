import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetExercises } from "../src/modules/workout/use-cases/GetExercises.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    exercise: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetExercises Use Case", () => {
  it("should return a list of exercises with favorite status", async () => {
    const userId = "u1";
    const mockExercises = [
      {
        id: "e1",
        name: "Push Up",
        muscleGroup: "CHEST",
        userFavorites: [{ isFavorite: true }],
      },
    ];

    (prisma.exercise.findMany as any).mockResolvedValue(mockExercises);

    const getExercises = new GetExercises();
    const result = await getExercises.execute({ userId });

    expect(prisma.exercise.findMany).toHaveBeenCalled();
    expect(result.exercises[0].isFavorite).toBe(true);
  });
});
