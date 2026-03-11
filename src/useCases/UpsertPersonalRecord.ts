import { prisma } from "../lib/db.js";
import { CheckAchievements } from "./CheckAchievements.js";
import { GrantXp } from "./GrantXp.js";

interface InputDto {
  userId: string;
  exerciseName: string;
  weightInGrams: number;
  reps: number;
}

export class UpsertPersonalRecord {
  async execute(dto: InputDto): Promise<void> {
    const existingPr = await prisma.personalRecord.findFirst({
      where: {
        userId: dto.userId,
        exerciseName: dto.exerciseName,
      },
      orderBy: { weightInGrams: "desc" },
    });

    if (!existingPr || dto.weightInGrams > existingPr.weightInGrams) {
      await prisma.$transaction(async (tx) => {
        await tx.personalRecord.create({
          data: {
            userId: dto.userId,
            exerciseName: dto.exerciseName,
            weightInGrams: dto.weightInGrams,
            reps: dto.reps,
          },
        });

        const grantXp = new GrantXp();

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

        const friendIds = friendships.map((f) =>
          f.userId === dto.userId ? f.friendId : f.userId,
        );

        if (friendIds.length > 0) {
          await tx.notification.createMany({
            data: friendIds.map((friendId) => ({
              recipientId: friendId,
              senderId: dto.userId,
              type: "PERSONAL_RECORD_BROKEN",
            })),
          });
        }
      });

      const checkAchievements = new CheckAchievements();
      await checkAchievements.execute({ userId: dto.userId });
    }
  }
}
