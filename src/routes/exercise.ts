import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { GetExercises } from "../modules/workout/use-cases/GetExercises.js";
import { ToggleFavoriteExercise } from "../modules/workout/use-cases/ToggleFavoriteExercise.js";
import { ErrorSchema, ExerciseSchema } from "../schemas/index.js";

export const exerciseRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:id/favorite",
    schema: {
      operationId: "toggleFavoriteExercise",
      tags: ["Exercises"],
      summary: "Toggle exercise as favorite",
      description: "Marks or unmarks an exercise as a favorite for the authenticated user.",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: z.object({ isFavorite: z.boolean() }),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const toggleFavorite = new ToggleFavoriteExercise();
      const result = await toggleFavorite.execute({
        userId: request.session.user.id,
        exerciseId: request.params.id,
      });
      return reply.status(200).send(result);
    },
  });

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
        favoritesOnly: z.coerce.boolean().optional(),
      }),
      response: {
        200: z.object({
          exercises: z.array(ExerciseSchema.extend({ isFavorite: z.boolean() })),
        }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getExercises = new GetExercises();
      const result = await getExercises.execute({
        userId: request.session.user.id,
        ...request.query,
      });

      return reply.status(200).send(result);
    },
  });
};
