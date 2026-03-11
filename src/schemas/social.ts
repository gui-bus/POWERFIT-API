import z from "zod";

import {
  FriendshipStatus,
  NotificationType,
} from "../generated/prisma/enums.js";

export const AddFriendSchema = z.object({
  codeOrEmail: z.string().trim().min(1),
});

export const FriendshipRequestSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(FriendshipStatus),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().nullable(),
  }),
});

export const GetFriendRequestsResponseSchema = z.array(FriendshipRequestSchema);

export const FriendSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  friendCode: z.string().nullable(),
  since: z.string(),
});

export const GetFriendsResponseSchema = z.array(FriendSchema);

export const CommentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  userName: z.string(),
  userImage: z.string().nullable(),
  content: z.string(),
  createdAt: z.string(),
});

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  userName: z.string(),
  userImage: z.string().nullable(),
  workoutDayName: z.string(),
  workoutPlanName: z.string(),
  statusMessage: z.string().nullable(),
  imageUrl: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string(),
  powerupsCount: z.number(),
  hasPowerupByMe: z.boolean(),
  createdAt: z.string(),
  comments: z.array(CommentSchema),
  taggedUsers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    }),
  ),
});

export const GetFeedResponseSchema = z.object({
  activities: z.array(ActivitySchema),
  nextCursor: z.string().uuid().nullable(),
});

export const CreateCommentSchema = z.object({
  content: z.string().trim().min(1).max(500),
});

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(NotificationType),
  isRead: z.boolean(),
  createdAt: z.string(),
  activityId: z.string().uuid().nullable(),
  achievementId: z.string().uuid().nullable(),
  content: z.string().nullable(),
  sender: z
    .object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    })
    .nullable(),
  achievement: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      iconUrl: z.string().nullable(),
    })
    .nullable(),
});

export const GetNotificationsResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  nextCursor: z.string().uuid().nullable(),
});
