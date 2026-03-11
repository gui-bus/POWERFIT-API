import { PrismaClient } from "../../../lib/db.js";
import { createAndEmitNotifications } from "../../../lib/notifications.js";
import { CheckAchievements } from "../../gamification/use-cases/CheckAchievements.js";
import { GrantXp } from "../../gamification/use-cases/GrantXp.js";

interface InputDto {
  userId: string;
  exerciseName: string;
  weightInGrams: number;
  reps: number;
}

export class UpsertPersonalRecord {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    const existingPr = await this.prisma.personalRecord.findFirst({
      where: {
        userId: dto.userId,
        exerciseName: dto.exerciseName,
      },
      orderBy: { weightInGrams: "desc" },
    });

    if (!existingPr || dto.weightInGrams > existingPr.weightInGrams) {
      await this.prisma.$transaction(async (tx: any) => {
        await tx.personalRecord.create({
          data: {
            userId: dto.userId,
            exerciseName: dto.exerciseName,
            weightInGrams: dto.weightInGrams,
            reps: dto.reps,
          },
        });

        const grantXp = new GrantXp(this.prisma);

        await grantXp.execute(
          {
            userId: dto.userId,
            amount: 100,
            reason: "PERSONAL_RECORD",
          },
          tx,
        );

        const friendships = await tx.friendship.findMany({
          where: {
            OR: [{ userId: dto.userId }, { friendId: dto.userId }],
            status: "ACCEPTED",
          },
        });

        const friendIds = friendships.map((f: any) =>
          f.userId === dto.userId ? f.friendId : f.userId,
        );

        if (friendIds.length > 0) {
          await createAndEmitNotifications(
            friendIds.map((friendId: any) => ({
              recipientId: friendId,
              senderId: dto.userId,
              type: "PERSONAL_RECORD_BROKEN",
            })),
            tx,
          );
        }
      });

      const checkAchievements = new CheckAchievements(this.prisma);
      await checkAchievements.execute({ userId: dto.userId });
    }
  }
}
