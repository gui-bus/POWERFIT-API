import dayjs from "dayjs";

import { NotificationType } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  cursor?: string;
  limit?: number;
}

interface OutputDto {
  notifications: Array<{
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
  }>;
  nextCursor: string | null;
}

export class GetNotifications {
  async execute(dto: InputDto): Promise<OutputDto> {
    const limit = dto.limit || 20;

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: dto.userId,
      },
      include: {
        sender: true,
        achievement: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      cursor: dto.cursor ? { id: dto.cursor } : undefined,
      skip: 0,
    });

    let nextCursor: string | null = null;
    if (notifications.length > limit) {
      const nextItem = notifications.pop();
      nextCursor = nextItem!.id;
    }

    const result = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: dayjs(notification.createdAt).toISOString(),
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

    return {
      notifications: result,
      nextCursor,
    };
  }
}
