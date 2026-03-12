import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import { ApplyWorkoutTemplate } from "../modules/workout/use-cases/ApplyWorkoutTemplate.js";
import { GetWorkoutTemplates } from "../modules/workout/use-cases/GetWorkoutTemplates.js";
import { ErrorSchema, WorkoutTemplateSchema } from "../schemas/index.js";

export const workoutTemplateRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getWorkoutTemplates",
      tags: ["Workout Templates"],
      summary: "List workout templates",
      description: "Returns a list of pre-defined workout plans categorized by goal and difficulty.",
      querystring: z.object({
        category: z.string().optional(),
        difficulty: z.string().optional(),
        query: z.string().optional(),
      }),
      response: {
        200: z.object({
          templates: z.array(WorkoutTemplateSchema),
        }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getWorkoutTemplates = new GetWorkoutTemplates();
      const result = await getWorkoutTemplates.execute(request.query);

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:id/apply",
    schema: {
      operationId: "applyWorkoutTemplate",
      tags: ["Workout Templates"],
      summary: "Apply template to user",
      description: "Creates a new workout plan for the authenticated user based on the selected template.",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        201: z.object({
          id: z.string().uuid(),
          name: z.string(),
        }),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const applyWorkoutTemplate = new ApplyWorkoutTemplate();
      const result = await applyWorkoutTemplate.execute({
        userId: request.session.user.id,
        templateId: request.params.id,
      });

      return reply.status(201).send(result);
    },
  });
};
