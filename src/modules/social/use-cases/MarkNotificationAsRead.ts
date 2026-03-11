import { NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  notificationId: string;
}

export class MarkNotificationAsRead {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: dto.notificationId },
    });

    if (!notification || notification.recipientId !== dto.userId) {
      throw new NotFoundError("Notification not found");
    }

    await this.prisma.notification.update({
      where: { id: dto.notificationId },
      data: { isRead: true },
    });
  }
}
