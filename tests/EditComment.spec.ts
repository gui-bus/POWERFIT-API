import { describe, expect, it, vi } from "vitest";

import { AppError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { EditComment } from "../src/modules/social/use-cases/EditComment.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    comment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("EditComment Use Case", () => {
  it("should update a comment if user is the owner", async () => {
    const userId = "user-123";
    const commentId = "comment-123";
    const content = "Updated comment content";
    const mockComment = { id: commentId, userId, content: "Old content" };

    (prisma.comment.findUnique as any).mockResolvedValue(mockComment);

    const editComment = new EditComment();
    await editComment.execute({ userId, commentId, content });

    expect(prisma.comment.update).toHaveBeenCalledWith({
      where: { id: commentId },
      data: { content },
    });
  });

  it("should throw error if comment does not exist", async () => {
    (prisma.comment.findUnique as any).mockResolvedValue(null);

    const editComment = new EditComment();
    await expect(
      editComment.execute({ userId: "any", commentId: "non-existent", content: "new" }),
    ).rejects.toThrow(AppError);
  });

  it("should throw error if user is not the owner", async () => {
    const mockComment = { id: "c1", userId: "owner-id", content: "..." };
    (prisma.comment.findUnique as any).mockResolvedValue(mockComment);

    const editComment = new EditComment();
    await expect(
      editComment.execute({ userId: "other-id", commentId: "c1", content: "new" }),
    ).rejects.toThrow(AppError);
  });
});
