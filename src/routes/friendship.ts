import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import {
  AddFriendSchema,
  ErrorSchema,
  GetFriendRequestsResponseSchema,
  GetFriendsResponseSchema,
  UserMeResponseSchema,
} from "../schemas/index.js";
import { AcceptFriendRequest } from "../useCases/AcceptFriendRequest.js";
import { AddFriend } from "../useCases/AddFriend.js";
import { DeclineFriendRequest } from "../useCases/DeclineFriendRequest.js";
import { GetFriendRequests } from "../useCases/GetFriendRequests.js";
import { GetFriends } from "../useCases/GetFriends.js";
import { GetMe } from "../useCases/GetMe.js";

export const friendshipRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/me",
    schema: {
      operationId: "getMe",
      tags: ["Friendship"],
      summary: "Get my user data and friend code",
      response: {
        200: UserMeResponseSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getMe = new GetMe();
      const result = await getMe.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getFriends",
      tags: ["Friendship"],
      summary: "Get friends list",
      response: {
        200: GetFriendsResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getFriends = new GetFriends();
      const result = await getFriends.execute({
        userId: request.session.user.id,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/requests",
    schema: {
      operationId: "getFriendRequests",
      tags: ["Friendship"],
      summary: "Get pending friend requests",
      querystring: z.object({
        type: z.enum(["RECEIVED", "SENT"]).default("RECEIVED"),
      }),
      response: {
        200: GetFriendRequestsResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { type } = request.query as { type: "RECEIVED" | "SENT" };

      const getFriendRequests = new GetFriendRequests();
      const result = await getFriendRequests.execute({
        userId: request.session.user.id,
        type,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "addFriend",
      tags: ["Friendship"],
      summary: "Send a friend request by code or email",
      body: AddFriendSchema,
      response: {
        200: UserMeResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const addFriend = new AddFriend();
      const result = await addFriend.execute({
        userId: request.session.user.id,
        codeOrEmail: request.body.codeOrEmail,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/requests/:id/accept",
    schema: {
      operationId: "acceptFriendRequest",
      tags: ["Friendship"],
      summary: "Accept a friend request",
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
      const acceptFriendRequest = new AcceptFriendRequest();
      await acceptFriendRequest.execute({
        userId: request.session.user.id,
        requestId: request.params.id,
      });

      return reply.status(204).send();
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/requests/:id/decline",
    schema: {
      operationId: "declineFriendRequest",
      tags: ["Friendship"],
      summary: "Decline or cancel a friend request",
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
      const declineFriendRequest = new DeclineFriendRequest();
      await declineFriendRequest.execute({
        userId: request.session.user.id,
        requestId: request.params.id,
      });

      return reply.status(204).send();
    },
  });
};
