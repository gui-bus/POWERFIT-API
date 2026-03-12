import { NotificationType } from "../generated/prisma/enums.js";
import { prisma, PrismaTransaction } from "./db.js";
import { notificationEvents } from "./events.js";

interface CreateNotificationDto {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  activityId?: string;
  achievementId?: string;
  challengeId?: string;
  content?: string;
}

export const createAndEmitNotification = async (
  dto: CreateNotificationDto,
  tx?: PrismaTransaction,
) => {
  const client = tx || prisma;
  const notification = await client.notification.create({
    data: {
      recipientId: dto.recipientId,
      senderId: dto.senderId,
      type: dto.type,
      activityId: dto.activityId,
      achievementId: dto.achievementId,
      challengeId: dto.challengeId,
      content: dto.content,
    },
  });

  notificationEvents.emit("new-notification", notification);

  return notification;
};

export const createAndEmitNotifications = async (
  dtos: CreateNotificationDto[],
  tx?: PrismaTransaction,
) => {
  const client = tx || prisma;
  
  // Since Prisma createMany doesn't return created items, 
  // and we need them for emitting events, we'll do individual creates 
  // or a custom query if performance is an issue. 
  // For tags, it's usually a small number of users.
  const notifications = await Promise.all(
    dtos.map((dto) =>
      client.notification.create({
        data: {
          recipientId: dto.recipientId,
          senderId: dto.senderId,
          type: dto.type,
          activityId: dto.activityId,
          achievementId: dto.achievementId,
          challengeId: dto.challengeId,
          content: dto.content,
        },
      }),
    ),
  );

  notifications.forEach((notification) => {
    notificationEvents.emit("new-notification", notification);
  });

  return notifications;
};
