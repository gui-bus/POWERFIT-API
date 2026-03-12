import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import { GetBodyProgressHistory } from "../modules/user/use-cases/GetBodyProgressHistory.js";
import { GetPersonalRecords } from "../modules/user/use-cases/GetPersonalRecords.js";
import { GetUserProfile } from "../modules/user/use-cases/GetUserProfile.js";
import { GetUserTrainData } from "../modules/user/use-cases/GetUserTrainData.js";
import { LogBodyProgress } from "../modules/user/use-cases/LogBodyProgress.js";
import { SearchUsers } from "../modules/user/use-cases/SearchUsers.js";
import { UpdatePrivacySettings } from "../modules/user/use-cases/UpdatePrivacySettings.js";
import { UpdateProfile } from "../modules/user/use-cases/UpdateProfile.js";
import { UpsertPersonalRecord } from "../modules/user/use-cases/UpsertPersonalRecord.js";
import { UpsertUserTrainData } from "../modules/user/use-cases/UpsertUserTrainData.js";
import {
  BodyProgressLogSchema,
  ErrorSchema,
  GetUserTrainDataResponseSchema,
  PersonalRecordSchema,
  PublicProfileResponseSchema,
  SearchUsersQuerySchema,
  SearchUsersResponseSchema,
  UpdatePrivacySchema,
  UpsertPersonalRecordSchema,
  UserTrainDataSchema,
} from "../schemas/index.js";
import { UpdateProfileSchema } from "../schemas/index.js";

export const userRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/me",
    schema: {
      operationId: "updateProfile",
      tags: ["User"],
      summary: "Update my profile",
      description: "Allows the user to change basic information such as name and profile picture.",
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
      summary: "Search users",
      description: "Performs a user search by name, facilitating friend discovery.",
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
      summary: "Get public profile",
      description: "Returns the public profile of any user in the system, respecting their privacy settings.",
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
      description: "Allows the user to define who can see their profile, feed, and other social information.",
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

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/personal-records",
    schema: {
      operationId: "getPersonalRecords",
      tags: ["User"],
      summary: "Get personal records",
      description: "Returns the user's list of PRs (Personal Records) in different exercises (e.g., Bench Press, Squat).",
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
      summary: "Save personal record",
      description: "Registers or updates a user's personal record for a specific exercise.",
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

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/body-progress",
    schema: {
      operationId: "getBodyProgressHistory",
      tags: ["User"],
      summary: "Get body measurement history",
      description: "Returns the detailed history of the user's weight, height, and body fat records.",
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
      summary: "Record body measurements",
      description: "Saves a new entry in the body progress diary (weight, BF, etc.).",
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

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/me",
    schema: {
      operationId: "getUserTrainData",
      tags: ["User"],
      summary: "Get current training data",
      description: "Returns the latest measurements recorded by the user (weight, height, age).",
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
      summary: "Update training data",
      description: "Sets or updates the user's current physical data used for performance calculations.",
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
