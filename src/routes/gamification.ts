import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  ErrorSchema,
  GetAchievementsResponseSchema,
  GetChallengesResponseSchema,
  GetXpHistoryResponseSchema,
} from "../schemas/index.js";
import { GetAchievements } from "../useCases/GetAchievements.js";
import { GetChallenges } from "../useCases/GetChallenges.js";
import { GetRanking } from "../useCases/GetRanking.js";
import { GetXpHistory } from "../useCases/GetXpHistory.js";
import { JoinChallenge } from "../useCases/JoinChallenge.js";

export const gamificationRoutes = async (app: FastifyInstance) => {
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
        200: z.object({
          ranking: z.array(z.any()),
          currentUserPosition: z.number().nullable(),
        }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const { sortBy } = request.query as { sortBy: "XP" | "STREAK" };

        const getRanking = new GetRanking();
        const result = await getRanking.execute({
          userId: session.user.id,
          sortBy,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const getAchievements = new GetAchievements();
        const result = await getAchievements.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const getChallenges = new GetChallenges();
        const result = await getChallenges.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const joinChallenge = new JoinChallenge();
        await joinChallenge.execute({
          userId: session.user.id,
          challengeId: request.params.id,
        });

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }
        return reply.status(400).send({
          error: error instanceof Error ? error.message : "Bad Request",
          code: "BAD_REQUEST",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const getXpHistory = new GetXpHistory();
        const result = await getXpHistory.execute({
          userId: session.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
