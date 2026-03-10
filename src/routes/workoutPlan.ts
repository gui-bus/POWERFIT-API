import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  SessionAlreadyCompletedError,
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { auth } from "../lib/auth.js";
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const { active } = request.query as { active?: boolean };

        const getWorkoutPlans = new GetWorkoutPlans();

        const result = await getWorkoutPlans.execute({
          userId: session.user.id,
          active,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const getWorkoutDay = new GetWorkoutDay();

        const result = await getWorkoutDay.execute({
          userId: session.user.id,
          workoutPlanId: request.params.workoutPlanId,
          workoutDayId: request.params.workoutDayId,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }

        if (error instanceof ForbiddenError) {
          return reply
            .status(403)
            .send({ error: error.message, code: "FORBIDDEN" });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const getWorkoutPlanById = new GetWorkoutPlanById();

        const result = await getWorkoutPlanById.execute({
          userId: session.user.id,
          workoutPlanId: request.params.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }

        if (error instanceof ForbiddenError) {
          return reply
            .status(403)
            .send({ error: error.message, code: "FORBIDDEN" });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const createWorkoutPlan = new CreateWorkoutPlan();

        const result = await createWorkoutPlan.execute({
          userId: session.user.id,
          ...request.body,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const startWorkoutSession = new StartWorkoutSession();

        const result = await startWorkoutSession.execute({
          userId: session.user.id,
          workoutPlanId: request.params.workoutPlanId,
          workoutDayId: request.params.workoutDayId,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }

        if (error instanceof ForbiddenError) {
          return reply
            .status(403)
            .send({ error: error.message, code: "FORBIDDEN" });
        }

        if (error instanceof WorkoutPlanNotActiveError) {
          return reply
            .status(400)
            .send({ error: error.message, code: "WORKOUT_PLAN_NOT_ACTIVE" });
        }

        if (error instanceof SessionAlreadyStartedError) {
          return reply
            .status(409)
            .send({ error: error.message, code: "SESSION_ALREADY_STARTED" });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      body: z.object({
        statusMessage: z.string().trim().optional(),
        taggedUserIds: z.array(z.string()).optional(),
      }).optional(),
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const completeWorkoutSession = new CompleteWorkoutSession();

        const result = await completeWorkoutSession.execute({
          userId: session.user.id,
          workoutPlanId: request.params.workoutPlanId,
          workoutDayId: request.params.workoutDayId,
          sessionId: request.params.sessionId,
          statusMessage: request.body?.statusMessage,
          taggedUserIds: request.body?.taggedUserIds,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }

        if (error instanceof ForbiddenError) {
          return reply
            .status(403)
            .send({ error: error.message, code: "FORBIDDEN" });
        }

        if (error instanceof BadRequestError) {
          return reply
            .status(400)
            .send({ error: error.message, code: "BAD_REQUEST" });
        }

        if (error instanceof SessionAlreadyCompletedError) {
          return reply
            .status(409)
            .send({ error: error.message, code: "SESSION_ALREADY_COMPLETED" });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  // NOVAS ROTAS DE LOG DE SÉRIES
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const upsertWorkoutSet = new UpsertWorkoutSet();
        await upsertWorkoutSet.execute({
          userId: session.user.id,
          sessionId: request.params.sessionId,
          workoutExerciseId: request.params.exerciseId,
          setIndex: request.params.setIndex,
          ...request.body,
        });

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const getHistory = new GetWorkoutExerciseHistory();
        const result = await getHistory.execute({
          userId: session.user.id,
          workoutExerciseId: request.params.exerciseId,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
