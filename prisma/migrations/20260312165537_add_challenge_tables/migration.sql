-- CreateEnum
CREATE TYPE "ChallengeGoal" AS ENUM ('WORKOUT_COUNT', 'TOTAL_VOLUME', 'TOTAL_XP', 'PR_COUNT', 'TOTAL_DURATION', 'STREAK_DAYS');

-- AlterTable
ALTER TABLE "challenge" ADD COLUMN     "goalTarget" INTEGER,
ADD COLUMN     "goalType" "ChallengeGoal",
ADD COLUMN     "targetUserId" TEXT;

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "challengeId" TEXT;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
