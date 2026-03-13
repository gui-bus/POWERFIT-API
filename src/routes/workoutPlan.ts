import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { WeekDay } from "../generated/prisma/enums.js";
import { authenticate } from "../lib/auth-middleware.js";
import { prisma } from "../lib/db.js";
import { ActivateWorkoutPlan } from "../modules/workout/use-cases/ActivateWorkoutPlan.js";
import { CompleteWorkoutSession } from "../modules/workout/use-cases/CompleteWorkoutSession.js";
import { CreateWorkoutPlan } from "../modules/workout/use-cases/CreateWorkoutPlan.js";
import { DeleteWorkoutPlan } from "../modules/workout/use-cases/DeleteWorkoutPlan.js";
import { GetWorkoutDay } from "../modules/workout/use-cases/GetWorkoutDay.js";
import { GetWorkoutExerciseHistory } from "../modules/workout/use-cases/GetWorkoutExerciseHistory.js";
import { GetWorkoutPlanById } from "../modules/workout/use-cases/GetWorkoutPlanById.js";
import { GetWorkoutPlans } from "../modules/workout/use-cases/GetWorkoutPlans.js";
import { StartWorkoutSession } from "../modules/workout/use-cases/StartWorkoutSession.js";
import { UpdateWorkoutDay } from "../modules/workout/use-cases/UpdateWorkoutDay.js";
import { UpsertWorkoutSet } from "../modules/workout/use-cases/UpsertWorkoutSet.js";
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

export const workoutPlanRoutes = async (app: FastifyInstance) => {
  app.addHook("onRequest", authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getWorkoutPlans",
      tags: ["Workout Plan"],
      summary: "List workout plans",
      description: "Returns all of the user's workout plans, with the option to filter by currently active plans.",
      query: GetWorkoutPlansQuerySchema,
      response: {
        200: GetWorkoutPlansResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { active } = request.query as { active?: boolean };

      const getWorkoutPlans = new GetWorkoutPlans(prisma);

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
      summary: "Get workout day details",
      description: "Returns the complete list of exercises and configurations for a specific day within a workout plan.",
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
      const getWorkoutDay = new GetWorkoutDay(prisma);

      const result = await getWorkoutDay.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.workoutPlanId,
        workoutDayId: request.params.workoutDayId,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:workoutPlanId/days/:workoutDayId",
    schema: {
      operationId: "updateWorkoutDay",
      tags: ["Workout Day"],
      summary: "Update a workout day",
      description: "Updates workout day details and synchronizes its exercises (upsert logic).",
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
      }),
      body: z.object({
        name: z.string().trim().min(1),
        weekDay: z.enum(WeekDay),
        isRestDay: z.boolean(),
        estimatedDurationInSeconds: z.number().int().min(0),
        coverImageUrl: z.string().url().nullable().optional(),
        exercises: z.array(
          z.object({
            name: z.string().trim().min(1),
            order: z.number().int().min(0),
            sets: z.number().int().min(1),
            reps: z.number().int().min(1),
            restTimeInSeconds: z.number().int().min(0),
          }),
        ),
      }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const updateWorkoutDay = new UpdateWorkoutDay();
      await updateWorkoutDay.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.workoutPlanId,
        workoutDayId: request.params.workoutDayId,
        ...request.body,
      });

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:id",
    schema: {
      operationId: "getWorkoutPlanById",
      tags: ["Workout Plan"],
      summary: "Get workout plan by ID",
      description: "Returns complete details for a specific workout plan, including all associated days and exercises.",
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
      const getWorkoutPlanById = new GetWorkoutPlanById(prisma);

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
      summary: "Create new workout plan",
      description: "Allows the creation of a complete workout plan, defining days of the week, exercises, sets, and repetitions.",
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
      const createWorkoutPlan = new CreateWorkoutPlan(prisma);

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
      description: "Logs the start of a real-time workout for a specific day. Only one session can be active at a time.",
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
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
      const startWorkoutSession = new StartWorkoutSession(prisma);

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
      summary: "Complete workout session",
      description: "Concludes an active workout session, allowing for the addition of a status message, photo, and tagged friends.",
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
        sessionId: z.string().uuid(),
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
      const completeWorkoutSession = new CompleteWorkoutSession(prisma);

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
      summary: "Record workout set",
      description: "Saves or updates load and repetition data for a specific set during an active workout.",
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
      const upsertWorkoutSet = new UpsertWorkoutSet(prisma);
      await upsertWorkoutSet.execute({
        userId: request.session.user.id,
        sessionId: request.params.sessionId,
        workoutExerciseId: request.params.exerciseId,
        setIndex: request.params.setIndex,
        ...request.body,
      });

      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/exercises/:exerciseId/history",
    schema: {
      operationId: "getWorkoutExerciseHistory",
      tags: ["Workout Session"],
      summary: "Get exercise history",
      description: "Returns the latest load and repetition record for a specific exercise to serve as a baseline for the current workout.",
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
      const getHistory = new GetWorkoutExerciseHistory(prisma);
      const result = await getHistory.execute({
        userId: request.session.user.id,
        workoutExerciseId: request.params.exerciseId,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:id/activate",
    schema: {
      operationId: "activateWorkoutPlan",
      tags: ["Workout Plan"],
      summary: "Activate a workout plan",
      description: "Sets a specific workout plan as active and deactivates all others for the user.",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        200: z.object({
          id: z.string().uuid(),
          name: z.string(),
        }),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const activateWorkoutPlan = new ActivateWorkoutPlan();
      const result = await activateWorkoutPlan.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.id,
      });

      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:id",
    schema: {
      operationId: "deleteWorkoutPlan",
      tags: ["Workout Plan"],
      summary: "Delete a workout plan",
      description: "Permanently removes a workout plan. Cannot delete the currently active plan.",
      params: z.object({
        id: z.string().uuid(),
      }),
      response: {
        204: z.null(),
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const deleteWorkoutPlan = new DeleteWorkoutPlan();
      await deleteWorkoutPlan.execute({
        userId: request.session.user.id,
        workoutPlanId: request.params.id,
      });

      return reply.status(204).send(null);
    },
  });
};
