import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { CreateExercise } from "../src/modules/user/use-cases/CreateExercise.js";
import { UpdateExercise } from "../src/modules/user/use-cases/UpdateExercise.js";
import { DeleteExercise } from "../src/modules/user/use-cases/DeleteExercise.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    exercise: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Exercise Management Use Cases", () => {
  it("should create an exercise", async () => {
    const dto = { name: "Push Up", muscleGroup: "Chest" };
    (prisma.exercise.create as any).mockResolvedValue({ id: "e1", ...dto });

    const createExercise = new CreateExercise();
    const result = await createExercise.execute(dto);

    expect(prisma.exercise.create).toHaveBeenCalled();
    expect(result.id).toBe("e1");
  });

  it("should update an exercise", async () => {
    (prisma.exercise.findUnique as any).mockResolvedValue({ id: "e1" });
    const updateExercise = new UpdateExercise();
    await updateExercise.execute({ id: "e1", name: "New Name" });

    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { id: "e1" },
      data: expect.objectContaining({ name: "New Name" }),
    });
  });

  it("should delete an exercise", async () => {
    (prisma.exercise.findUnique as any).mockResolvedValue({ id: "e1" });
    const deleteExercise = new DeleteExercise();
    await deleteExercise.execute({ id: "e1" });

    expect(prisma.exercise.delete).toHaveBeenCalledWith({ where: { id: "e1" } });
  });
});
