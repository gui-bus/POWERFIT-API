import { AppError } from "../../../errors/index.js";
import { Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  targetUserId: string;
  role: Role;
}

export class UpdateUserRole {
  async execute(dto: InputDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: dto.targetUserId },
    });

    if (!user) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    await prisma.user.update({
      where: { id: dto.targetUserId },
      data: { role: dto.role },
    });
  }
}
