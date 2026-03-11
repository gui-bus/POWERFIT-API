import { describe, expect, it, vi, beforeEach } from "vitest";
import { DeleteActivity } from "../src/useCases/DeleteActivity.js";
import { prisma } from "../src/lib/db.js";
import { ForbiddenError, NotFoundError } from "../src/errors/index.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    activity: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("DeleteActivity Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete activity if user is the owner", async () => {
    const userId = "user-1";
    const activityId = "activity-1";

    (prisma.activity.findUnique as any).mockResolvedValue({
      id: activityId,
      userId,
    });

    const deleteActivity = new DeleteActivity();
    await deleteActivity.execute({ userId, activityId });

    expect(prisma.activity.delete).toHaveBeenCalledWith({
      where: { id: activityId },
    });
  });

  it("should throw ForbiddenError if user is not the owner", async () => {
    const userId = "user-1";
    const activityId = "activity-1";

    (prisma.activity.findUnique as any).mockResolvedValue({
      id: activityId,
      userId: "other-user",
    });

    const deleteActivity = new DeleteActivity();
    await expect(
      deleteActivity.execute({ userId, activityId }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("should throw NotFoundError if activity does not exist", async () => {
    (prisma.activity.findUnique as any).mockResolvedValue(null);

    const deleteActivity = new DeleteActivity();
    await expect(
      deleteActivity.execute({ userId: "any", activityId: "any" }),
    ).rejects.toThrow(NotFoundError);
  });
});
