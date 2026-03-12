import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { GetExercises } from "../modules/workout/use-cases/GetExercises.js";
import { ErrorSchema, ExerciseSchema } from "../schemas/index.js";

export const exerciseRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getExercises",
      tags: ["Exercises"],
      summary: "List exercises from library",
      description: "Returns a list of exercises from the PowerFIT global library, with optional filtering by muscle group or name.",
      querystring: z.object({
        muscleGroup: z.string().optional(),
        query: z.string().optional(),
      }),
      response: {
        200: z.object({
          exercises: z.array(ExerciseSchema),
        }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getExercises = new GetExercises();
      const result = await getExercises.execute(request.query);

      return reply.status(200).send(result);
    },
  });
};
