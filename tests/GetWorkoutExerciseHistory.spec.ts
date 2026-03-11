import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetWorkoutExerciseHistory } from "../src/modules/workout/use-cases/GetWorkoutExerciseHistory.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutSession: {
      findFirst: vi.fn(),
    },
  },
}));

describe("GetWorkoutExerciseHistory Use Case", () => {
  it("should return last sets for a specific exercise", async () => {
    const userId = "user-1";
    const exerciseId = "ex-1";
    const mockSession = {
      id: "sess-1",
      sets: [
        {
          id: "set-1",
          sessionId: "sess-1",
          workoutExerciseId: exerciseId,
          setIndex: 0,
          weightInGrams: 50000,
          reps: 10,
          createdAt: new Date(),
        },
      ],
    };

    (prisma.workoutSession.findFirst as any).mockResolvedValue(mockSession);

    const getHistory = new GetWorkoutExerciseHistory(prisma as any);
    const result = await getHistory.execute({ userId, workoutExerciseId: exerciseId });

    expect(result).not.toBeNull();
    expect(result?.lastSets).toHaveLength(1);
    expect(result?.lastSets[0].weightInGrams).toBe(50000);
  });

  it("should return null if no history found", async () => {
    (prisma.workoutSession.findFirst as any).mockResolvedValue(null);

    const getHistory = new GetWorkoutExerciseHistory(prisma as any);
    const result = await getHistory.execute({ userId: "any", workoutExerciseId: "none" });

    expect(result).toBeNull();
  });
});
