import dayjs from "dayjs";

import { ForbiddenError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";
import { areFriends } from "../../../lib/social.js";

interface InputDto {
  userId: string;
  targetUserId?: string;
  cursor?: string;
  limit?: number;
}

interface OutputDto {
  activities: Array<{
    id: string;
    userId: string;
    userName: string;
    userImage: string | null;
    workoutDayName: string;
    workoutPlanName: string;
    statusMessage: string | null;
    imageUrl: string | null;
    startedAt: string;
    completedAt: string;
    powerupsCount: number;
    hasPowerupByMe: boolean;
    createdAt: string;
    comments: Array<{
      id: string;
      userId: string;
      userName: string;
      userImage: string | null;
      content: string;
      createdAt: string;
    }>;
    taggedUsers: Array<{
      id: string;
      name: string;
      image: string | null;
    }>;
  }>;
  nextCursor: string | null;
}

export class GetFeed {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const limit = dto.limit || 10;
    let userIdsInFeed: string[];

    if (dto.targetUserId && dto.targetUserId !== dto.userId) {
      const friends = await areFriends(dto.userId, dto.targetUserId);

      if (!friends) {
        throw new ForbiddenError("You can only view feeds of your friends");
      }
      userIdsInFeed = [dto.targetUserId];
    } else if (dto.targetUserId === dto.userId) {
      userIdsInFeed = [dto.userId];
    } else {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [{ userId: dto.userId }, { friendId: dto.userId }],
          status: "ACCEPTED",
        },
      });

      const friendIds = friendships.map((f: any) =>
        f.userId === dto.userId ? f.friendId : f.userId,
      );

      userIdsInFeed = [...friendIds, dto.userId];
    }

    const activities = await this.prisma.activity.findMany({
      where: {
        OR: [
          { userId: { in: userIdsInFeed } },
          { taggedUsers: { some: { id: { in: userIdsInFeed } } } },
        ],
      },
      include: {
        user: true,
        workoutDay: {
          include: {
            workoutPlan: true,
          },
        },
        workoutSession: true,
        powerups: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
        taggedUsers: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      cursor: dto.cursor ? { id: dto.cursor } : undefined,
      skip: dto.cursor ? 1 : 0,
    });

    const hasNextPage = activities.length > limit;
    if (hasNextPage) {
      activities.pop();
    }
    const nextCursor = hasNextPage ? activities[activities.length - 1].id : null;

    const result = activities.map((activity: any) => ({
      id: activity.id,
      userId: activity.user.id,
      userName: activity.user.name,
      userImage: activity.user.image,
      workoutDayName: activity.workoutDay.name,
      workoutPlanName: activity.workoutDay.workoutPlan.name,
      statusMessage: activity.statusMessage,
      imageUrl: activity.imageUrl,
      startedAt: dayjs(activity.workoutSession.startedAt).toISOString(),
      completedAt: dayjs(activity.workoutSession.completedAt!).toISOString(),
      powerupsCount: activity.powerups.length,
      hasPowerupByMe: activity.powerups.some((p: any) => p.userId === dto.userId),
      createdAt: dayjs(activity.createdAt).toISOString(),
      comments: activity.comments.map((c: any) => ({
        id: c.id,
        userId: c.user.id,
        userName: c.user.name,
        userImage: c.user.image,
        content: c.content,
        createdAt: dayjs(c.createdAt).toISOString(),
      })),
      taggedUsers: activity.taggedUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        image: u.image,
      })),
    }));

    return {
      activities: result,
      nextCursor,
    };
  }
}
