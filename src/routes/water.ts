import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { GetWaterHistory } from "../modules/user/use-cases/GetWaterHistory.js";
import { LogWater } from "../modules/user/use-cases/LogWater.js";
import { ErrorSchema, LogWaterSchema, WaterLogSchema } from "../schemas/index.js";

export const waterRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:date",
    schema: {
      operationId: "getWaterHistory",
      tags: ["Water Tracker"],
      summary: "Get water intake history",
      description: "Returns the total water intake and detailed logs for a specific date (YYYY-MM-DD).",
      params: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
      }),
      response: {
        200: z.object({
          totalInMl: z.number().int(),
          logs: z.array(WaterLogSchema),
        }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getWaterHistory = new GetWaterHistory();
      const result = await getWaterHistory.execute({
        userId: request.session.user.id,
        date: request.params.date,
      });

      return reply.status(200).send({
        totalInMl: result.totalInMl,
        logs: result.logs.map((log) => ({
          ...log,
          loggedAt: log.loggedAt.toISOString(),
        })),
      });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "logWater",
      tags: ["Water Tracker"],
      summary: "Log water intake",
      description: "Records a new amount of water consumed by the user.",
      body: LogWaterSchema,
      response: {
        201: WaterLogSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const logWater = new LogWater();
      const result = await logWater.execute({
        userId: request.session.user.id,
        amountInMl: request.body.amountInMl,
      });

      return reply.status(201).send({
        ...result,
        loggedAt: result.loggedAt.toISOString(),
      });
    },
  });
};
