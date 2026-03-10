import { describe, expect, it, vi } from "vitest";
import { UpsertWorkoutSet } from "../src/useCases/UpsertWorkoutSet.js";
import { prisma } from "../src/lib/db.js";
import { NotFoundError } from "../src/errors/index.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutSession: { findUnique: vi.fn() },
    workoutSet: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
  },
}));

describe("UpsertWorkoutSet Use Case", () => {
  const dto = {
    userId: "user-1",
    sessionId: "session-1",
    workoutExerciseId: "exercise-1",
    setIndex: 0,
    weightInGrams: 50000,
    reps: 10,
  };

  it("should create a new set if it doesn't exist", async () => {
    (prisma.workoutSession.findUnique as any).mockResolvedValue({
      id: "session-1",
      completedAt: null,
      workoutDay: { workoutPlan: { userId: "user-1" } }
    });
    (prisma.workoutSet.findFirst as any).mockResolvedValue(null);

    const upsertWorkoutSet = new UpsertWorkoutSet();
    await upsertWorkoutSet.execute(dto);

    expect(prisma.workoutSet.create).toHaveBeenCalled();
  });

  it("should update an existing set", async () => {
    (prisma.workoutSession.findUnique as any).mockResolvedValue({
      id: "session-1",
      completedAt: null,
      workoutDay: { workoutPlan: { userId: "user-1" } }
    });
    (prisma.workoutSet.findFirst as any).mockResolvedValue({ id: "set-1" });

    const upsertWorkoutSet = new UpsertWorkoutSet();
    await upsertWorkoutSet.execute(dto);

    expect(prisma.workoutSet.update).toHaveBeenCalledWith({
      where: { id: "set-1" },
      data: expect.anything()
    });
  });

  it("should throw Error if session is already completed", async () => {
    (prisma.workoutSession.findUnique as any).mockResolvedValue({
      id: "session-1",
      completedAt: new Date(),
      workoutDay: { workoutPlan: { userId: "user-1" } }
    });

    const upsertWorkoutSet = new UpsertWorkoutSet();
    await expect(upsertWorkoutSet.execute(dto)).rejects.toThrow("Cannot modify sets of a completed session");
  });
});
