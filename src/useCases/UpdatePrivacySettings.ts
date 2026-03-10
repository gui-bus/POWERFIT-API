import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  isPublicProfile?: boolean;
  showStats?: boolean;
}

export class UpdatePrivacySettings {
  async execute(dto: InputDto): Promise<void> {
    await prisma.user.update({
      where: { id: dto.userId },
      data: {
        isPublicProfile: dto.isPublicProfile,
        showStats: dto.showStats,
      },
    });
  }
}
