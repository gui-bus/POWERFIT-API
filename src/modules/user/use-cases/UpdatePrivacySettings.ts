import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  isPublicProfile?: boolean;
  showStats?: boolean;
}

export class UpdatePrivacySettings {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        isPublicProfile: dto.isPublicProfile,
        showStats: dto.showStats,
      },
    });
  }
}
