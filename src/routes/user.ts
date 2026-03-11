import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
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
import { UpdateProfileSchema } from "../schemas/index.js";
import { GetBodyProgressHistory } from "../modules/user/use-cases/GetBodyProgressHistory.js";
import { GetPersonalRecords } from "../modules/user/use-cases/GetPersonalRecords.js";
import { GetRanking } from "../modules/gamification/use-cases/GetRanking.js";
import { GetUserProfile } from "../modules/user/use-cases/GetUserProfile.js";
import { GetUserTrainData } from "../modules/user/use-cases/GetUserTrainData.js";
import { LogBodyProgress } from "../modules/user/use-cases/LogBodyProgress.js";
import { SearchUsers } from "../modules/user/use-cases/SearchUsers.js";
import { UpdatePrivacySettings } from "../modules/user/use-cases/UpdatePrivacySettings.js";
import { UpdateProfile } from "../modules/user/use-cases/UpdateProfile.js";
import { UpsertPersonalRecord } from "../modules/user/use-cases/UpsertPersonalRecord.js";
import { UpsertUserTrainData } from "../modules/user/use-cases/UpsertUserTrainData.js";

export const userRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/me",
    schema: {
      operationId: "updateProfile",
      tags: ["User"],
      summary: "Update my profile",
      body: UpdateProfileSchema,
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          image: z.string().nullable(),
        }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const updateProfile = new UpdateProfile(prisma);
      const result = await updateProfile.execute({
        userId: request.session.user.id,
        ...request.body,
      });

      return reply.status(200).send(result);
    },
  });

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
      const { query } = request.query as { query: string };

      const searchUsers = new SearchUsers(prisma);
      const result = await searchUsers.execute({
        userId: request.session.user.id,
        query,
      });

      return reply.status(200).send(result);
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
      const getUserProfile = new GetUserProfile(prisma);
      const result = await getUserProfile.execute({
        userId: request.session.user.id,
        targetUserId: request.params.userId,
      });

      return reply.status(200).send(result);
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
      const updatePrivacySettings = new UpdatePrivacySettings(prisma);
      await updatePrivacySettings.execute({
        userId: request.session.user.id,
        ...request.body,
      });

      return reply.status(204).send();
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
      const getPersonalRecords = new GetPersonalRecords(prisma);
      const result = await getPersonalRecords.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
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
      const upsertPersonalRecord = new UpsertPersonalRecord(prisma);
      await upsertPersonalRecord.execute({
        userId: request.session.user.id,
        ...request.body,
      });

      return reply.status(204).send();
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
      const getBodyProgressHistory = new GetBodyProgressHistory(prisma);
      const result = await getBodyProgressHistory.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
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
      const logBodyProgress = new LogBodyProgress(prisma);
      await logBodyProgress.execute({
        userId: request.session.user.id,
        ...request.body,
      });

      return reply.status(204).send();
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
      const { sortBy } = request.query as { sortBy: "STREAK" | "XP" };

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
      const getUserTrainData = new GetUserTrainData(prisma);
      const result = await getUserTrainData.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
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
      const upsertUserTrainData = new UpsertUserTrainData(prisma);
      const result = await upsertUserTrainData.execute({
        userId: request.session.user.id,
        ...request.body,
      });

      return reply.status(200).send(result);
    },
  });
};
