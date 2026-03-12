import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createRouteHandler } from "uploadthing/fastify";

import { AppError } from "./errors/index.js";
import { auth } from "./lib/auth.js";
import { authenticate } from "./lib/auth-middleware.js";
import { env } from "./lib/env.js";
import { uploadRouter } from "./lib/uploadthing.js";
import { aiRoutes } from "./routes/ai.js";
import { exerciseRoutes } from "./routes/exercise.js";
import { feedRoutes } from "./routes/feed.js";
import { friendshipRoutes } from "./routes/friendship.js";
import { gamificationRoutes } from "./routes/gamification.js";
import { homeRoutes } from "./routes/home.js";
import { notificationRoutes } from "./routes/notifications.js";
import { statsRoutes } from "./routes/stats.js";
import { userRoutes } from "./routes/user.js";
import { waterRoutes } from "./routes/water.js";
import { workoutPlanRoutes } from "./routes/workoutPlan.js";
import { workoutTemplateRoutes } from "./routes/workoutTemplate.js";

const envToLogger: any = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const app = Fastify({
  logger: envToLogger[env.NODE_ENV] ?? true,
  trustProxy: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

declare module "fastify" {
  interface FastifyRequest {
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  }
}

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code,
    });
  }

  if ((error as any).validation) {
    return reply.status(400).send({
      error: "Validation error",
      code: "VALIDATION_ERROR",
      details: (error as any).validation,
    });
  }

  return reply.status(500).send({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
});

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "PowerFIT API",
      description:
        "Complete PowerFIT API documentation - Workout management, gamification, and fitness social network.",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Production Server",
        url: env.API_BASE_URL || "http://localhost:8080",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

app.addHook("onRoute", (routeOptions) => {
  if (routeOptions.url.includes("uploadthing")) {
    routeOptions.schema = {
      ...routeOptions.schema,
      tags: ["Upload"],
      summary: "UploadThing API",
      hide: true,
    };
  }
});

await app.register(fastifyCors, {
  origin: [env.WEB_APP_BASE_URL || "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

await app.register(createRouteHandler, {
  router: uploadRouter,
  config: {
    token: env.UPLOADTHING_TOKEN,
  },
});

await app.register(fastifyApiReference, {
  routePrefix: "/",
  configuration: {
    isEditable: false,
    hideTestRequestButton: env.NODE_ENV === "production",
    hideModels: false,
    theme: "purple",
    sources: [
      {
        title: "PowerFIT API",
        slug: "powerfit-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

await app.register(workoutPlanRoutes, { prefix: "/workout-plans" });
await app.register(homeRoutes, { prefix: "/home" });
await app.register(statsRoutes, { prefix: "/stats" });
await app.register(friendshipRoutes, { prefix: "/friendships" });
await app.register(feedRoutes, { prefix: "/feed" });
await app.register(notificationRoutes, { prefix: "/notifications" });
await app.register(gamificationRoutes, { prefix: "/gamification" });
await app.register(exerciseRoutes, { prefix: "/exercises" });
await app.register(waterRoutes, { prefix: "/water" });
await app.register(workoutTemplateRoutes, { prefix: "/workout-templates" });
await app.register(userRoutes);
await app.register(aiRoutes, { prefix: "/ai" });

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  schema: {
    hide: true,
    tags: ["Auth"],
    summary: "Better Auth API",
    description:
      "External authentication API handling login, registration, and session management.",
  },
  async handler(request, reply) {
    try {
      const protocol = request.headers["x-forwarded-proto"] || "http";
      const host = request.headers["x-forwarded-host"] || request.headers.host;
      const url = new URL(request.url, `${protocol}://${host}`);

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

if (env.NODE_ENV !== "test") {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

export { app, authenticate };
