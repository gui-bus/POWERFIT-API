import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { DeleteComment } from "../modules/social/use-cases/DeleteComment.js";
import { EditComment } from "../modules/social/use-cases/EditComment.js";
import { ToggleBlockUser } from "../modules/social/use-cases/ToggleBlockUser.js";
import { ErrorSchema } from "../schemas/index.js";

export const socialRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/comments/:id",
    schema: {
      operationId: "editComment",
      tags: ["Social"],
      summary: "Edit own comment",
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ content: z.string().trim().min(1) }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const editComment = new EditComment();
      await editComment.execute({
        userId: request.session.user.id,
        commentId: request.params.id,
        content: request.body.content,
      });
      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/comments/:id",
    schema: {
      operationId: "deleteComment",
      tags: ["Social"],
      summary: "Delete own comment",
      params: z.object({ id: z.string().uuid() }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const deleteComment = new DeleteComment();
      await deleteComment.execute({
        userId: request.session.user.id,
        commentId: request.params.id,
      });
      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/users/:id/block",
    schema: {
      operationId: "toggleBlockUser",
      tags: ["Social"],
      summary: "Block/Unblock user",
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({ isBlocked: z.boolean() }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const toggleBlock = new ToggleBlockUser();
      const result = await toggleBlock.execute({
        userId: request.session.user.id,
        targetUserId: request.params.id,
      });
      return reply.status(200).send(result);
    },
  });
};
