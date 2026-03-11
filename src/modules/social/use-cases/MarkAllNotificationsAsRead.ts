import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
}

export class MarkAllNotificationsAsRead {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        recipientId: dto.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
