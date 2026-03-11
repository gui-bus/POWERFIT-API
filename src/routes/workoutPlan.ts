import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { authenticate } from "../lib/auth-middleware.js";
import {
  ErrorSchema,
  GetWorkoutDayResponseSchema,
  GetWorkoutPlanByIdResponseSchema,
  GetWorkoutPlansQuerySchema,
  GetWorkoutPlansResponseSchema,
  UpsertWorkoutSetSchema,
  WorkoutExerciseHistorySchema,
  WorkoutPlanSchema,
  WorkoutSessionSchema,
} from "../schemas/index.js";
import { CompleteWorkoutSession } from "../useCases/CompleteWorkoutSession.js";
import { CreateWorkoutPlan } from "../useCases/CreateWorkoutPlan.js";
import { GetWorkoutDay } from "../useCases/GetWorkoutDay.js";
import { GetWorkoutExerciseHistory } from "../useCases/GetWorkoutExerciseHistory.js";
import { GetWorkoutPlanById } from "../useCases/GetWorkoutPlanById.js";
import { GetWorkoutPlans } from "../useCases/GetWorkoutPlans.js";
import { StartWorkoutSession } from "../useCases/StartWorkoutSession.js";
import { UpsertWorkoutSet } from "../useCases/UpsertWorkoutSet.js";

export const workoutPlanRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getWorkoutPlans",
      tags: ["Workout Plan"],
      summary: "Get all workout plans",
      query: GetWorkoutPlansQuerySchema,
      response: {
        200: GetWorkoutPlansResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { active } = request.query as { active?: boolean };

      const getWorkoutPlans = new GetWorkoutPlans();

      const result = await getWorkoutPlans.execute({
        userId: request.session.user.id,
        active,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId/days/:workoutDayId",
    schema: {
      operationId: "getWorkoutDayById",
      tags: ["Workout Day"],
      summary: "Get workout day by id",
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
      }),
      response: {
        200: GetWorkoutDayResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getWorkoutDay = new GetWorkoutDay();

      const result = await getWorkoutDay.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.workoutPlanId,
        workoutDayId: request.params.workoutDayId,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:id",
    schema: {
      operationId: "getWorkoutPlanById",
      tags: ["Workout Plan"],
      summary: "Get workout plan by id",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: GetWorkoutPlanByIdResponseSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getWorkoutPlanById = new GetWorkoutPlanById();

      const result = await getWorkoutPlanById.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.id,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      operationId: "createWorkoutPlan",
      tags: ["Workout Plan"],
      summary: "Create a workout plan",
      body: WorkoutPlanSchema.omit({ id: true }),
      response: {
        201: WorkoutPlanSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const createWorkoutPlan = new CreateWorkoutPlan();

      const result = await createWorkoutPlan.execute({
        userId: request.session.user.id,
        ...request.body,
      });

      return reply.status(201).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:workoutPlanId/days/:workoutDayId/sessions",
    schema: {
      operationId: "startWorkoutSession",
      tags: ["Workout Session"],
      summary: "Start a workout session",
      params: z.object({
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
      }),
      response: {
        201: WorkoutSessionSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const startWorkoutSession = new StartWorkoutSession();

      const result = await startWorkoutSession.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.workoutPlanId,
        workoutDayId: request.params.workoutDayId,
      });

      return reply.status(201).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:workoutPlanId/days/:workoutDayId/sessions/:sessionId",
    schema: {
      operationId: "completeWorkoutSession",
      tags: ["Workout Session"],
      summary: "Update a workout session",
      params: z.object({
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
        sessionId: z.uuid(),
      }),
      body: z
        .object({
          statusMessage: z.string().trim().optional(),
          imageUrl: z.string().url().optional(),
          taggedUserIds: z.array(z.string()).optional(),
        })
        .optional(),
      response: {
        200: WorkoutSessionSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const completeWorkoutSession = new CompleteWorkoutSession();

      const result = await completeWorkoutSession.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.workoutPlanId,
        workoutDayId: request.params.workoutDayId,
        sessionId: request.params.sessionId,
        statusMessage: request.body?.statusMessage,
        imageUrl: request.body?.imageUrl,
        taggedUserIds: request.body?.taggedUserIds,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/sessions/:sessionId/exercises/:exerciseId/sets/:setIndex",
    schema: {
      operationId: "upsertWorkoutSet",
      tags: ["Workout Session"],
      summary: "Log or update a workout set",
      params: z.object({
        sessionId: z.string().uuid(),
        exerciseId: z.string().uuid(),
        setIndex: z.coerce.number().int().min(0),
      }),
      body: UpsertWorkoutSetSchema,
      response: {
        204: z.null(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const upsertWorkoutSet = new UpsertWorkoutSet();
      await upsertWorkoutSet.execute({
        userId: request.session.user.id,
        sessionId: request.params.sessionId,
        workoutExerciseId: request.params.exerciseId,
        setIndex: request.params.setIndex,
        ...request.body,
      });

      return reply.status(204).send();
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/exercises/:exerciseId/history",
    schema: {
      operationId: "getWorkoutExerciseHistory",
      tags: ["Workout Session"],
      summary: "Get the last log for a specific exercise",
      params: z.object({
        exerciseId: z.string().uuid(),
      }),
      response: {
        200: WorkoutExerciseHistorySchema.nullable(),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const getHistory = new GetWorkoutExerciseHistory();
      const result = await getHistory.execute({
        userId: request.session.user.id,
        workoutExerciseId: request.params.exerciseId,
      });

      return reply.status(200).send(result);
    },
  });
};
