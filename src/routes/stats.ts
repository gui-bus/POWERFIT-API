import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "../lib/auth.js";
import { ErrorSchema, StatsResponseSchema } from "../schemas/index.js";
import { GetStats } from "../useCases/GetStats.js";

export const statsRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Stats"],
      summary: "Get user workout stats",
      query: z.object({
        from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
        to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
      }),
      response: {
        200: StatsResponseSchema,
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

        const { from, to } = request.query as { from: string; to: string };

        const getStats = new GetStats();
        const result = await getStats.execute({
          userId: session.user.id,
          from,
          to,
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
};
