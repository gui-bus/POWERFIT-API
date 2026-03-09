import { NotificationType } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  id: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  activityId: string | null;
  sender: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

export class GetNotifications {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: dto.userId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      activityId: notification.activityId,
      sender: notification.sender
        ? {
            id: notification.sender.id,
            name: notification.sender.name,
            image: notification.sender.image,
          }
        : null,
    }));
  }
}
