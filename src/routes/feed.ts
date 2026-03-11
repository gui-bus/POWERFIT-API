import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import {
  CreateCommentSchema,
  ErrorSchema,
  GetFeedResponseSchema,
  PaginationQuerySchema,
} from "../schemas/index.js";
import { AddComment } from "../modules/social/use-cases/AddComment.js";
import { DeleteActivity } from "../modules/social/use-cases/DeleteActivity.js";
import { GetFeed } from "../modules/social/use-cases/GetFeed.js";
import { TogglePowerup } from "../modules/social/use-cases/TogglePowerup.js";

export const feedRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getFeed",
      tags: ["Feed"],
      summary: "Get activities feed",
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
      summary: "Get activities feed for a specific user",
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
      summary: "Toggle powerup on an activity",
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
      summary: "Add a comment to an activity",
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
