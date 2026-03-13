import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { ToggleFavoriteExercise } from "../src/modules/workout/use-cases/ToggleFavoriteExercise.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    exercise: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    workoutExercise: {
      findUnique: vi.fn(),
    },
    userExercise: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("ToggleFavoriteExercise Use Case", () => {
  it("should create a favorite entry if it doesn't exist", async () => {
    const userId = "u1";
    const exerciseId = "e1";

    (prisma.exercise.findUnique as any).mockResolvedValue({ id: exerciseId });
    (prisma.userExercise.findUnique as any).mockResolvedValue(null);
    (prisma.userExercise.create as any).mockResolvedValue({ exerciseId, isFavorite: true });

    const toggleFavoriteExercise = new ToggleFavoriteExercise();
    const result = await toggleFavoriteExercise.execute({ userId, exerciseId });

    expect(prisma.userExercise.create).toHaveBeenCalled();
    expect(result.isFavorite).toBe(true);
  });

  it("should toggle favorite status if entry exists", async () => {
    const userId = "u1";
    const exerciseId = "e1";
    const mockUserExercise = { id: "ue1", exerciseId, isFavorite: true };

    (prisma.exercise.findUnique as any).mockResolvedValue({ id: exerciseId });
    (prisma.userExercise.findUnique as any).mockResolvedValue(mockUserExercise);
    (prisma.userExercise.update as any).mockResolvedValue({ ...mockUserExercise, isFavorite: false });

    const toggleFavoriteExercise = new ToggleFavoriteExercise();
    const result = await toggleFavoriteExercise.execute({ userId, exerciseId });

    expect(prisma.userExercise.update).toHaveBeenCalledWith({
      where: { id: "ue1" },
      data: { isFavorite: false },
    });
    expect(result.isFavorite).toBe(false);
  });
});
