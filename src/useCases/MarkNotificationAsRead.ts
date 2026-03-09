import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  notificationId: string;
}

export class MarkNotificationAsRead {
  async execute(dto: InputDto): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: dto.notificationId },
    });

    if (!notification || notification.recipientId !== dto.userId) {
      throw new NotFoundError("Notification not found");
    }

    await prisma.notification.update({
      where: { id: dto.notificationId },
      data: { isRead: true },
    });
  }
}
