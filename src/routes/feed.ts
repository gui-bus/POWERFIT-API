import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import { AddComment } from "../modules/social/use-cases/AddComment.js";
import { DeleteActivity } from "../modules/social/use-cases/DeleteActivity.js";
import { GetFeed } from "../modules/social/use-cases/GetFeed.js";
import { TogglePowerup } from "../modules/social/use-cases/TogglePowerup.js";
import {
  CreateCommentSchema,
  ErrorSchema,
  GetFeedResponseSchema,
  PaginationQuerySchema,
} from "../schemas/index.js";

export const feedRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getFeed",
      tags: ["Feed"],
      summary: "Get activity feed",
      description: "Returns a paginated list of activities (completed workouts) from the authenticated user's friends and the user themselves.",
      querystring: PaginationQuerySchema,
      response: {
        200: GetFeedResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { cursor, limit } = request.query as {
        cursor?: string;
        limit?: number;
      };

      const getFeed = new GetFeed(prisma);
      const result = await getFeed.execute({
        userId: request.session.user.id,
        cursor,
        limit,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/users/:userId",
    schema: {
      operationId: "getUserFeed",
      tags: ["Feed"],
      summary: "Get activity feed for a specific user",
      description: "Returns a public list of activities for a specific user. Respects the target user's privacy settings.",
      params: z.object({
        userId: z.string(),
      }),
      querystring: PaginationQuerySchema,
      response: {
        200: GetFeedResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { cursor, limit } = request.query as {
        cursor?: string;
        limit?: number;
      };

      const getFeed = new GetFeed(prisma);
      const result = await getFeed.execute({
        userId: request.session.user.id,
        targetUserId: request.params.userId,
        cursor,
        limit,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/activities/:id/powerup",
    schema: {
      operationId: "togglePowerup",
      tags: ["Feed"],
      summary: "Give or remove Powerup from an activity",
      description: "The Powerup is PowerFIT's equivalent to a 'like'. If the user has already given a Powerup, it will be removed (toggle).",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const togglePowerup = new TogglePowerup(prisma);
      await togglePowerup.execute({
        userId: request.session.user.id,
        activityId: request.params.id,
      });

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/activities/:id/comments",
    schema: {
      operationId: "addComment",
      tags: ["Feed"],
      summary: "Add comment to an activity",
      description: "Allows the user to interact with friends' activities through comments.",
      params: z.object({
        id: z.string().uuid(),
      }),
      body: CreateCommentSchema,
      response: {
        204: z.null(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const addComment = new AddComment(prisma);
      await addComment.execute({
        userId: request.session.user.id,
        activityId: request.params.id,
        content: request.body.content,
      });

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/activities/:id",
    schema: {
      operationId: "deleteActivity",
      tags: ["Feed"],
      summary: "Delete an activity",
      description: "Allows the user to remove one of their own activities from the public feed.",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const deleteActivity = new DeleteActivity(prisma);
      await deleteActivity.execute({
        userId: request.session.user.id,
        activityId: request.params.id,
      });

      return reply.status(204).send(null);
    },
  });
};
