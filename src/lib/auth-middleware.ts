import { fromNodeHeaders } from "better-auth/node";
import { FastifyReply, FastifyRequest } from "fastify";

import { auth } from "./auth.js";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    return reply.status(401).send({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  if ((session.user as any).isBanned) {
    return reply.status(403).send({
      error: "Forbidden: Your account has been suspended",
      code: "USER_BANNED",
    });
  }

  request.session = session;
};

export const authorize = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.session) {
      return reply.status(401).send({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    const userRole = (request.session.user as any).role || "USER";

    if (!allowedRoles.includes(userRole)) {
      return reply.status(403).send({
        error: "Forbidden: You do not have the required permissions",
        code: "FORBIDDEN",
      });
    }
  };
};

