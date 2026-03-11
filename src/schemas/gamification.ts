import z from "zod";

import {
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
});

export const GetChallengesResponseSchema = z.array(ChallengeSchema);

export const XpTransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  reason: z.enum(XpReason),
  createdAt: z.string(),
});

export const GetXpHistoryResponseSchema = z.array(XpTransactionSchema);
