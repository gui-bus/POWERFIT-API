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
  achievementId: string | null;
  content: string | null;
  sender: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  achievement: {
    id: string;
    name: string;
    iconUrl: string | null;
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
        achievement: true,
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
      achievementId: notification.achievementId,
      content: notification.content,
      sender: notification.sender
        ? {
            id: notification.sender.id,
            name: notification.sender.name,
            image: notification.sender.image,
          }
        : null,
      achievement: notification.achievement
        ? {
            id: notification.achievement.id,
            name: notification.achievement.name,
            iconUrl: notification.achievement.iconUrl,
          }
        : null,
    }));
  }
}
