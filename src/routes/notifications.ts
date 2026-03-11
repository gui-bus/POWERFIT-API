import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { NotFoundError } from "../errors/index.js";
import { Notification } from "../generated/prisma/client.js";
import { auth } from "../lib/auth.js";
import { notificationEvents } from "../lib/events.js";
import {
  ErrorSchema,
  GetNotificationsResponseSchema,
  PaginationQuerySchema,
} from "../schemas/index.js";
import { GetNotifications } from "../useCases/GetNotifications.js";
import { MarkAllNotificationsAsRead } from "../useCases/MarkAllNotificationsAsRead.js";
import { MarkNotificationAsRead } from "../useCases/MarkNotificationAsRead.js";

export const notificationRoutes = async (app: FastifyInstance) => {
  app.get("/stream", async (request, reply) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const userId = session.user.id;

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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const { cursor, limit } = request.query as {
          cursor?: string;
          limit?: number;
        };

        const getNotifications = new GetNotifications();
        const result = await getNotifications.execute({
          userId: session.user.id,
          cursor,
          limit,
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const markAllNotificationsAsRead = new MarkAllNotificationsAsRead();
        await markAllNotificationsAsRead.execute({
          userId: session.user.id,
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const markNotificationAsRead = new MarkNotificationAsRead();
        await markNotificationAsRead.execute({
          userId: session.user.id,
          notificationId: request.params.id,
        });

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
