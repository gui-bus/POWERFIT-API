import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import {
  ErrorSchema,
  GetAchievementsResponseSchema,
  GetChallengesResponseSchema,
  GetXpHistoryResponseSchema,
  UserRankingResponseSchema,
} from "../schemas/index.js";
import { GetAchievements } from "../modules/gamification/use-cases/GetAchievements.js";
import { GetChallenges } from "../modules/gamification/use-cases/GetChallenges.js";
import { GetRanking } from "../modules/gamification/use-cases/GetRanking.js";
import { GetXpHistory } from "../modules/gamification/use-cases/GetXpHistory.js";
import { JoinChallenge } from "../modules/gamification/use-cases/JoinChallenge.js";

export const gamificationRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/ranking",
    schema: {
      operationId: "getRanking",
      tags: ["Gamification"],
      summary: "Get users ranking",
      querystring: z.object({
        sortBy: z.enum(["XP", "STREAK"]),
      }),
      response: {
        200: UserRankingResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { sortBy } = request.query as { sortBy: "XP" | "STREAK" };

      const getRanking = new GetRanking(prisma);
      const result = await getRanking.execute({
        userId: request.session.user.id,
        sortBy,
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
      summary: "Get all achievements and user progress",
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
      summary: "Get available challenges",
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
      summary: "Get XP transaction history",
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
