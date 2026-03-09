import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

export class MarkAllNotificationsAsRead {
  async execute(dto: InputDto): Promise<void> {
    await prisma.notification.updateMany({
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
