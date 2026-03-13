import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { AdminDeleteActivity } from "../src/modules/social/use-cases/AdminDeleteActivity.js";
import { AdminDeleteComment } from "../src/modules/social/use-cases/AdminDeleteComment.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    activity: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Admin Social Moderation Use Cases", () => {
  it("should delete any activity", async () => {
    (prisma.activity.findUnique as any).mockResolvedValue({ id: "a1" });
    const deleteActivity = new AdminDeleteActivity();
    await deleteActivity.execute({ activityId: "a1" });

    expect(prisma.activity.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
  });

  it("should delete any comment", async () => {
    (prisma.comment.findUnique as any).mockResolvedValue({ id: "c1" });
    const deleteComment = new AdminDeleteComment();
    await deleteComment.execute({ commentId: "c1" });

    expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
