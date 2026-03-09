import { ForbiddenError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  targetUserId?: string;
}

interface OutputDto {
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
}

export class GetFeed {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    let userIdsInFeed: string[] = [];

    if (dto.targetUserId && dto.targetUserId !== dto.userId) {
      // Verificar se são amigos antes de mostrar o feed individual
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: dto.userId, friendId: dto.targetUserId },
            { userId: dto.targetUserId, friendId: dto.userId },
          ],
          status: "ACCEPTED",
        },
      });

      if (!friendship) {
        throw new ForbiddenError("You can only view feeds of your friends");
      }
      userIdsInFeed = [dto.targetUserId];
    } else if (dto.targetUserId === dto.userId) {
      userIdsInFeed = [dto.userId];
    } else {
      // Feed global: Buscar lista de IDs de amigos aceitos
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { userId: dto.userId },
            { friendId: dto.userId },
          ],
          status: "ACCEPTED",
        },
      });

      const friendIds = friendships.map((f) =>
        f.userId === dto.userId ? f.friendId : f.userId,
      );

      // Incluir o próprio usuário no feed
      userIdsInFeed = [...friendIds, dto.userId];
    }

    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { userId: { in: userIdsInFeed } },
          { taggedUsers: { some: { id: { in: userIdsInFeed } } } }
        ]
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
          orderBy: { createdAt: "asc" }
        },
        taggedUsers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return activities.map((activity) => ({
      id: activity.id,
      userId: activity.user.id,
      userName: activity.user.name,
      userImage: activity.user.image,
      workoutDayName: activity.workoutDay.name,
      workoutPlanName: activity.workoutDay.workoutPlan.name,
      statusMessage: activity.statusMessage,
      imageUrl: activity.imageUrl,
      startedAt: activity.workoutSession.startedAt.toISOString(),
      completedAt: activity.workoutSession.completedAt!.toISOString(),
      powerupsCount: activity.powerups.length,
      hasPowerupByMe: activity.powerups.some((p) => p.userId === dto.userId),
      createdAt: activity.createdAt.toISOString(),
      comments: activity.comments.map((c) => ({
        id: c.id,
        userId: c.user.id,
        userName: c.user.name,
        userImage: c.user.image,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      taggedUsers: activity.taggedUsers.map((u) => ({
        id: u.id,
        name: u.name,
        image: u.image,
      })),
    }));
  }
}
