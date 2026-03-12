import z from "zod";

import {
  ChallengeGoal,
  ChallengeStatus,
  ChallengeType,
  XpReason,
} from "../generated/prisma/enums.js";

export const UserRankingSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  streak: z.number(),
  xp: z.number(),
  level: z.number(),
});

export const GetRankingQuerySchema = z.object({
  sortBy: z.enum(["STREAK", "XP"]).default("STREAK"),
});

export const UserRankingResponseSchema = z.object({
  ranking: z.array(UserRankingSchema),
  currentUserPosition: z.number().nullable(),
});

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().nullable(),
  xpReward: z.number(),
  unlockedAt: z.string().optional().nullable(),
});

export const GetAchievementsResponseSchema = z.array(AchievementSchema);

export const ChallengeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  type: z.enum(ChallengeType),
  status: z.enum(ChallengeStatus),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  xpReward: z.number(),
  participantsCount: z.number(),
  isJoined: z.boolean(),
  goalType: z.enum(ChallengeGoal).nullable().optional(),
  goalTarget: z.number().nullable().optional(),
});

export const ChallengeProgressSchema = ChallengeSchema.extend({
  participants: z.array(
    z.object({
      userId: z.string(),
      userName: z.string(),
      score: z.number(),
      hasWon: z.boolean(),
    }),
  ),
});

export const CreateChallengeSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  opponentId: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  xpReward: z.number().int().min(0).default(50),
  goalType: z.enum(ChallengeGoal),
  goalTarget: z.number().int().min(1),
});

export const GetChallengesResponseSchema = z.array(ChallengeSchema);

export const XpTransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  reason: z.enum(XpReason),
  createdAt: z.string(),
});

export const GetXpHistoryResponseSchema = z.array(XpTransactionSchema);
