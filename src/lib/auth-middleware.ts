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

  request.session = session;
};
