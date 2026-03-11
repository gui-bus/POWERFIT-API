import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import { ErrorSchema, HomeDataSchema } from "../schemas/index.js";
import { GetHomeData } from "../modules/workout/use-cases/GetHomeData.js";

export const homeRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:date",
    schema: {
      operationId: "getHomeData",
      tags: ["Home screen"],
      summary: "Get home page data",
      params: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
      }),
      response: {
        200: HomeDataSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getHomeData = new GetHomeData(prisma);
      const result = await getHomeData.execute({
        userId: request.session.user.id,
        date: request.params.date,
      });

      return reply.status(200).send(result);
    },
  });
};
