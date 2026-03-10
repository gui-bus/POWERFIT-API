import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import {
  BodyProgressLogSchema,
  ErrorSchema,
  GetRankingQuerySchema,
  GetUserTrainDataResponseSchema,
  PersonalRecordSchema,
  PublicProfileResponseSchema,
  SearchUsersQuerySchema,
  SearchUsersResponseSchema,
  UpdatePrivacySchema,
  UpsertPersonalRecordSchema,
  UserRankingResponseSchema,
  UserTrainDataSchema,
} from "../schemas/index.js";
import { GetBodyProgressHistory } from "../useCases/GetBodyProgressHistory.js";
import { GetPersonalRecords } from "../useCases/GetPersonalRecords.js";
import { GetRanking } from "../useCases/GetRanking.js";
import { GetUserProfile } from "../useCases/GetUserProfile.js";
import { GetUserTrainData } from "../useCases/GetUserTrainData.js";
import { LogBodyProgress } from "../useCases/LogBodyProgress.js";
import { SearchUsers } from "../useCases/SearchUsers.js";
import { UpdatePrivacySettings } from "../useCases/UpdatePrivacySettings.js";
import { UpsertPersonalRecord } from "../useCases/UpsertPersonalRecord.js";
import { UpsertUserTrainData } from "../useCases/UpsertUserTrainData.js";

export const userRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/search",
    schema: {
      operationId: "searchUsers",
      tags: ["User"],
      summary: "Search for users",
      query: SearchUsersQuerySchema,
      response: {
        200: SearchUsersResponseSchema,
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

        const { query } = request.query as { query: string };

        const searchUsers = new SearchUsers();
        const result = await searchUsers.execute({
          userId: session.user.id,
          query,
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
    url: "/profile/:userId",
    schema: {
      operationId: "getUserProfile",
      tags: ["User"],
      summary: "Get a user's public profile",
      params: z.object({
        userId: z.string(),
      }),
      response: {
        200: PublicProfileResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
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

        const getUserProfile = new GetUserProfile();
        const result = await getUserProfile.execute({
          userId: session.user.id,
          targetUserId: request.params.userId,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }
        if (error instanceof ForbiddenError) {
          return reply
            .status(403)
            .send({ error: error.message, code: "FORBIDDEN" });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/me/privacy",
    schema: {
      operationId: "updatePrivacySettings",
      tags: ["User"],
      summary: "Update privacy settings",
      body: UpdatePrivacySchema,
      response: {
        204: z.null(),
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

        const updatePrivacySettings = new UpdatePrivacySettings();
        await updatePrivacySettings.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(204).send();
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
    url: "/personal-records",
    schema: {
      operationId: "getPersonalRecords",
      tags: ["User"],
      summary: "Get user personal records",
      response: {
        200: z.array(PersonalRecordSchema),
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

        const getPersonalRecords = new GetPersonalRecords();
        const result = await getPersonalRecords.execute({
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
    url: "/personal-records",
    schema: {
      operationId: "upsertPersonalRecord",
      tags: ["User"],
      summary: "Upsert a personal record",
      body: UpsertPersonalRecordSchema,
      response: {
        204: z.null(),
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

        const upsertPersonalRecord = new UpsertPersonalRecord();
        await upsertPersonalRecord.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(204).send();
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
    url: "/body-progress",
    schema: {
      operationId: "getBodyProgressHistory",
      tags: ["User"],
      summary: "Get body progress history",
      response: {
        200: z.array(BodyProgressLogSchema),
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

        const getBodyProgressHistory = new GetBodyProgressHistory();
        const result = await getBodyProgressHistory.execute({
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
    url: "/body-progress",
    schema: {
      operationId: "logBodyProgress",
      tags: ["User"],
      summary: "Log a new body progress entry",
      body: UserTrainDataSchema,
      response: {
        204: z.null(),
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

        const logBodyProgress = new LogBodyProgress();
        await logBodyProgress.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(204).send();
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
    url: "/ranking",
    schema: {
      operationId: "getRanking",
      tags: ["User"],
      summary: "Get users ranking",
      querystring: GetRankingQuerySchema,
      response: {
        200: UserRankingResponseSchema,
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

        const { sortBy } = request.query as { sortBy: "STREAK" | "XP" };

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
    url: "/me",
    schema: {
      operationId: "getUserTrainData",
      tags: ["User"],
      summary: "Get user training data",
      response: {
        200: GetUserTrainDataResponseSchema,
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

        const getUserTrainData = new GetUserTrainData();
        const result = await getUserTrainData.execute({
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
    url: "/me",
    schema: {
      operationId: "upsertUserTrainData",
      tags: ["User"],
      summary: "Upsert user training data",
      body: UserTrainDataSchema,
      response: {
        200: UserTrainDataSchema,
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

        const upsertUserTrainData = new UpsertUserTrainData();
        const result = await upsertUserTrainData.execute({
          userId: session.user.id,
          ...request.body,
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
