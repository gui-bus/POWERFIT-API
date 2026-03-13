import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  commentId: string;
}

export class AdminDeleteComment {
  async execute(dto: InputDto): Promise<void> {
    const comment = await prisma.comment.findUnique({
      where: { id: dto.commentId },
    });

    if (!comment) {
      throw new AppError("Comment not found", "NOT_FOUND", 404);
    }

    await prisma.comment.delete({
      where: { id: dto.commentId },
    });
  }
}
