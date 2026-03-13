import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import { CreateChallenge } from "../modules/gamification/use-cases/CreateChallenge.js";
import { GetAchievements } from "../modules/gamification/use-cases/GetAchievements.js";
import { GetChallengeById } from "../modules/gamification/use-cases/GetChallengeById.js";
import { GetChallenges } from "../modules/gamification/use-cases/GetChallenges.js";
import { GetRanking } from "../modules/gamification/use-cases/GetRanking.js";
import { GetXpHistory } from "../modules/gamification/use-cases/GetXpHistory.js";
import { JoinChallenge } from "../modules/gamification/use-cases/JoinChallenge.js";
import { StreakRepair } from "../modules/gamification/use-cases/StreakRepair.js";
import { ChallengeProgressSchema,ChallengeSchema, CreateChallengeSchema } from "../schemas/gamification.js";
import {
  ErrorSchema,
  GetAchievementsResponseSchema,
  GetChallengesResponseSchema,
  GetXpHistoryResponseSchema,
  UserRankingResponseSchema,
} from "../schemas/index.js";

export const gamificationRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/streak-repair",
    schema: {
      operationId: "streakRepair",
      tags: ["Gamification"],
      summary: "Repair broken streak",
      description: "Uses 500 XP to restore a broken workout streak to 1 day.",
      response: {
        200: z.object({ newStreak: z.number(), newXp: z.number() }),
        400: ErrorSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const streakRepair = new StreakRepair();
      const result = await streakRepair.execute({ userId: request.session.user.id });
      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/challenges/:id",
    schema: {
      operationId: "getChallengeById",
      tags: ["Gamification"],
      summary: "Get challenge details",
      description: "Returns full information about a challenge (duel) and the current progress of all participants.",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: ChallengeProgressSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getChallengeById = new GetChallengeById(prisma);
      const result = await getChallengeById.execute({
        userId: request.session.user.id,
        challengeId: request.params.id,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/challenges",
    schema: {
      operationId: "createChallenge",
      tags: ["Gamification"],
      summary: "Create a new challenge (duel)",
      description: "Creates a competitive challenge between friends. The creator automatically joins the challenge.",
      body: CreateChallengeSchema,
      response: {
        201: ChallengeSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const createChallenge = new CreateChallenge(prisma);
      const result = await createChallenge.execute({
        userId: request.session.user.id,
        ...request.body,
      });

      return reply.status(201).send({
        ...result,
        participantsCount: 1,
        isJoined: true,
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/ranking",
    schema: {
      operationId: "getRanking",
      tags: ["Gamification"],
      summary: "Get user ranking",
      description: "Returns the global user ranking, which can be sorted by total XP or consecutive workout days (streak).",
      querystring: z.object({
        sortBy: z.enum(["XP", "STREAK"]),
        friendsOnly: z.coerce.boolean().optional(),
      }),
      response: {
        200: UserRankingResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { sortBy, friendsOnly } = request.query as {
        sortBy: "XP" | "STREAK";
        friendsOnly?: boolean;
      };

      const getRanking = new GetRanking(prisma);
      const result = await getRanking.execute({
        userId: request.session.user.id,
        sortBy,
        friendsOnly,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/achievements",
    schema: {
      operationId: "getAchievements",
      tags: ["Gamification"],
      summary: "List achievements and medals",
      description: "Returns all available achievements in the system and the user's current progress in each.",
      response: {
        200: GetAchievementsResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getAchievements = new GetAchievements(prisma);
      const result = await getAchievements.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/challenges",
    schema: {
      operationId: "getChallenges",
      tags: ["Gamification"],
      summary: "List available challenges",
      description: "Returns the list of challenges (duels) the user is participating in or that are open to join.",
      response: {
        200: GetChallengesResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getChallenges = new GetChallenges(prisma);
      const result = await getChallenges.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/challenges/:id/join",
    schema: {
      operationId: "joinChallenge",
      tags: ["Gamification"],
      summary: "Join a challenge",
      description: "Enrolls the authenticated user into an existing challenge using the ID.",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const joinChallenge = new JoinChallenge(prisma);
      await joinChallenge.execute({
        userId: request.session.user.id,
        challengeId: request.params.id,
      });

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/xp-history",
    schema: {
      operationId: "getXpHistory",
      tags: ["Gamification"],
      summary: "Get XP history",
      description: "Returns a detailed statement of all XP points earned by the user, indicating the source (workout, challenge, achievement).",
      response: {
        200: GetXpHistoryResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getXpHistory = new GetXpHistory(prisma);
      const result = await getXpHistory.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
    },
  });
};
