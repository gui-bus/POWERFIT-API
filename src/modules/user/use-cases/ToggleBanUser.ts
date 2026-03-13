import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  targetUserId: string;
}

export class ToggleBanUser {
  async execute(dto: InputDto): Promise<{ isBanned: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: dto.targetUserId },
    });

    if (!user) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    if (user.role === "ADMIN") {
      throw new AppError("Cannot ban another administrator", "FORBIDDEN", 403);
    }

    const updatedUser = await prisma.user.update({
      where: { id: dto.targetUserId },
      data: { isBanned: !user.isBanned },
    });

    return { isBanned: updatedUser.isBanned };
  }
}
