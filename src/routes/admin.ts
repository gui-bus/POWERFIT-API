import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { Role } from "../generated/prisma/enums.js";
import { authenticate, authorize } from "../lib/auth-middleware.js";
import { AdminDeleteActivity } from "../modules/social/use-cases/AdminDeleteActivity.js";
import { AdminDeleteComment } from "../modules/social/use-cases/AdminDeleteComment.js";
import { CreateExercise } from "../modules/user/use-cases/CreateExercise.js";
import { DeleteExercise } from "../modules/user/use-cases/DeleteExercise.js";
import { GetAdminStats } from "../modules/user/use-cases/GetAdminStats.js";
import { GetAllUsers } from "../modules/user/use-cases/GetAllUsers.js";
import { ToggleBanUser } from "../modules/user/use-cases/ToggleBanUser.js";
import { UpdateExercise } from "../modules/user/use-cases/UpdateExercise.js";
import { UpdateUserRole } from "../modules/user/use-cases/UpdateUserRole.js";
import { ErrorSchema } from "../schemas/index.js";

export const adminRoutes = async (app: FastifyInstance) => {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", authorize(["ADMIN"]));

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/stats",
    schema: {
      tags: ["Admin"],
      summary: "Get engagement metrics (Admin only)",
      response: {
        200: z.object({
          totalUsers: z.number(),
          bannedUsers: z.number(),
          totalActivities: z.number(),
          totalWorkoutPlans: z.number(),
          totalExercises: z.number(),
        }),
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async () => {
      const getAdminStats = new GetAdminStats();
      return await getAdminStats.execute();
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/users/:id/role",
    schema: {
      tags: ["Admin"],
      summary: "Update user role (Admin only)",
      params: z.object({ id: z.string() }),
      body: z.object({ role: z.enum(["USER", "ADMIN"]) }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const updateUserRole = new UpdateUserRole();
      await updateUserRole.execute({ 
        targetUserId: request.params.id, 
        role: request.body.role as Role 
      });
      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/users",
    schema: {
      tags: ["Admin"],
      summary: "List all users with pagination and sorting (Admin only)",
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(1).max(100).default(10),
        orderBy: z.enum(["createdAt", "role", "xp", "name"]).default("createdAt"),
        orderDir: z.enum(["asc", "desc"]).default("desc"),
      }),
      response: {
        200: z.object({
          users: z.array(z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            image: z.string().nullable(),
            role: z.string(),
            isBanned: z.boolean(),
            level: z.number(),
            xp: z.number(),
            createdAt: z.date(),
          })),
          total: z.number(),
          page: z.number(),
          pageSize: z.number(),
        }),
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request) => {
      const getAllUsers = new GetAllUsers();
      return await getAllUsers.execute(request.query);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/users/:id/toggle-ban",
    schema: {
      tags: ["Admin"],
      summary: "Ban or unban a user (Admin only)",
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({ isBanned: z.boolean() }),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request) => {
      const toggleBanUser = new ToggleBanUser();
      return await toggleBanUser.execute({ targetUserId: request.params.id });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/activities/:id",
    schema: {
      tags: ["Admin"],
      summary: "Delete any activity (Admin only)",
      params: z.object({ id: z.string().uuid() }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const adminDeleteActivity = new AdminDeleteActivity();
      await adminDeleteActivity.execute({ activityId: request.params.id });
      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/comments/:id",
    schema: {
      tags: ["Admin"],
      summary: "Delete any comment (Admin only)",
      params: z.object({ id: z.string().uuid() }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const adminDeleteComment = new AdminDeleteComment();
      await adminDeleteComment.execute({ commentId: request.params.id });
      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/exercises",
    schema: {
      tags: ["Admin"],
      summary: "Create a new official exercise (Admin only)",
      body: z.object({
        name: z.string().trim().min(1),
        description: z.string().optional(),
        muscleGroup: z.string().trim().min(1),
        equipment: z.string().optional(),
        instructions: z.string().optional(),
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        difficulty: z.string().optional(),
      }),
      response: {
        201: z.object({ id: z.string(), name: z.string() }),
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const createExercise = new CreateExercise();
      const result = await createExercise.execute(request.body);
      return reply.status(201).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/exercises/:id",
    schema: {
      tags: ["Admin"],
      summary: "Update an existing exercise (Admin only)",
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        muscleGroup: z.string().optional(),
        equipment: z.string().optional(),
        instructions: z.string().optional(),
        imageUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        difficulty: z.string().optional(),
      }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const updateExercise = new UpdateExercise();
      await updateExercise.execute({ id: request.params.id, ...request.body });
      return reply.status(204).send(null);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/exercises/:id",
    schema: {
      tags: ["Admin"],
      summary: "Delete an exercise (Admin only)",
      params: z.object({ id: z.string().uuid() }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const deleteExercise = new DeleteExercise();
      await deleteExercise.execute({ id: request.params.id });
      return reply.status(204).send(null);
    },
  });
};

