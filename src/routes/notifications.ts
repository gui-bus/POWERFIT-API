import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { Notification } from "../generated/prisma/client.js";
import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import { notificationEvents } from "../lib/events.js";
import {
  ErrorSchema,
  GetNotificationsResponseSchema,
  PaginationQuerySchema,
} from "../schemas/index.js";
import { GetNotifications } from "../modules/social/use-cases/GetNotifications.js";
import { MarkAllNotificationsAsRead } from "../modules/social/use-cases/MarkAllNotificationsAsRead.js";
import { MarkNotificationAsRead } from "../modules/social/use-cases/MarkNotificationAsRead.js";

export const notificationRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.get("/stream", async (request, reply) => {
    const userId = request.session.user.id;

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    const keepAliveInterval = setInterval(() => {
      reply.raw.write(`: keep-alive\n\n`);
    }, 30000);

    const onNotification = (notification: Notification) => {
      if (notification.recipientId === userId) {
        reply.raw.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    };

    notificationEvents.on("new-notification", onNotification);

    request.raw.on("close", () => {
      clearInterval(keepAliveInterval);
      notificationEvents.removeListener("new-notification", onNotification);
    });
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getNotifications",
      tags: ["Notification"],
      summary: "Get my notifications",
      querystring: PaginationQuerySchema,
      response: {
        200: GetNotificationsResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { cursor, limit } = request.query as {
        cursor?: string;
        limit?: number;
      };

      const getNotifications = new GetNotifications(prisma);
      const result = await getNotifications.execute({
        userId: request.session.user.id,
        cursor,
        limit,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/read-all",
    schema: {
      operationId: "markAllNotificationsAsRead",
      tags: ["Notification"],
      summary: "Mark all my notifications as read",
      response: {
        204: z.null(),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const markAllNotificationsAsRead = new MarkAllNotificationsAsRead(prisma);
      await markAllNotificationsAsRead.execute({
        userId: request.session.user.id,
      });

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:id/read",
    schema: {
      operationId: "markNotificationAsRead",
      tags: ["Notification"],
      summary: "Mark a notification as read",
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
      const markNotificationAsRead = new MarkNotificationAsRead(prisma);
      await markNotificationAsRead.execute({
        userId: request.session.user.id,
        notificationId: request.params.id,
      });

      return reply.status(204).send(null);
    },
  });
};
