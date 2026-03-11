import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { ErrorSchema, StatsResponseSchema } from "../schemas/index.js";
import { GetStats } from "../useCases/GetStats.js";

export const statsRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getStats",
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
      const { from, to } = request.query as { from: string; to: string };

      const getStats = new GetStats();
      const result = await getStats.execute({
        userId: request.session.user.id,
        from,
        to,
      });

      return reply.status(200).send(result);
    },
  });
};
