import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  commentId: string;
}

export class DeleteComment {
  async execute(dto: InputDto): Promise<void> {
    const comment = await prisma.comment.findUnique({
      where: { id: dto.commentId },
    });

    if (!comment || comment.userId !== dto.userId) {
      throw new AppError("Comment not found or unauthorized", "NOT_FOUND", 404);
    }

    await prisma.comment.delete({
      where: { id: dto.commentId },
    });
  }
}
