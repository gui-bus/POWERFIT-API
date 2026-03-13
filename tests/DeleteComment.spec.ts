import { describe, expect, it, vi } from "vitest";

import { AppError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { DeleteComment } from "../src/modules/social/use-cases/DeleteComment.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    comment: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("DeleteComment Use Case", () => {
  it("should delete a comment if user is the owner", async () => {
    const userId = "user-123";
    const commentId = "comment-123";
    const mockComment = { id: commentId, userId };

    (prisma.comment.findUnique as any).mockResolvedValue(mockComment);

    const deleteComment = new DeleteComment();
    await deleteComment.execute({ userId, commentId });

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: commentId },
    });
  });

  it("should throw error if user is not the owner", async () => {
    const mockComment = { id: "c1", userId: "owner-id" };
    (prisma.comment.findUnique as any).mockResolvedValue(mockComment);

    const deleteComment = new DeleteComment();
    await expect(
      deleteComment.execute({ userId: "other-id", commentId: "c1" }),
    ).rejects.toThrow(AppError);
  });
});
