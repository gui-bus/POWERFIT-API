# GEMINI.md - Fit App API

## Project Overview

**Fit App API** is a high-performance backend service for a fitness application, built with **Node.js**, **TypeScript**, and **Fastify**. It utilizes **Prisma** as its ORM and **Better-Auth** for authentication.

---

## Infrastructure & Environment

### Docker (Database)

The project uses Docker to provide a local PostgreSQL database instance.

- **Service:** `postgres:16-alpine`
- **Commands:**
  - `docker compose up -d`: Start the database in the background.
  - `docker compose down`: Stop the database and remove containers.
  - `docker compose stop`: Pause the database container.
- **Configuration:** Managed via `docker-compose.yml`.

### Environment Variables (.env)

Ensure your `.env` file contains:

- `DATABASE_URL`: `postgresql://postgres:your-password@localhost:5432/fit-app-api?schema=public`
- `PORT`: (Default: 8080)
- `BETTER_AUTH_SECRET`: Secret for auth session generation.
- `BETTER_AUTH_URL`: Base URL of the API (e.g., http://localhost:8080).

---

## Architecture & Project Structure

The project follows a clean, use-case driven architecture:

- **Routes (`src/routes/`):** API entry points. They handle data validation, authentication, and Use Case calls. They must follow **REST** principles.
- **Use Cases (`src/useCases/`):** Contain 100% of the business logic.
- **Schemas (`src/schemas/`):** Centralized Zod validation definitions.
- **Errors (`src/errors/`):** Custom error classes.
- **Infrastructure/Libs (`src/lib/`):**
  - `db.ts`: Prisma Client configuration with PG adapter.
  - `auth.ts`: Better-Auth configuration.
- **Prisma (`prisma/`):**
  - `schema.prisma`: Source of truth for database models.

---

## Development & Build Commands

- `pnpm install`: Install dependencies.
- `pnpm dev`: Start the development server with `tsx --watch`.
- `pnpm prisma generate`: Generate the Prisma client and enums.
- `pnpm prisma db push`: Synchronize the database schema during development.
- `pnpm prisma studio`: Open a visual editor for your database data.

---

## Development Rules

### 1. Git Conventions

- **Conventional Commits:** **ALWAYS** use [Conventional Commits](https://www.conventionalcommits.org/).
  - Examples: `feat: add start workout session endpoint`, `fix: workout plan validation`, `docs: update architecture rules`.
- **Commit Permission:** **NEVER** commit without explicit user permission. Always wait for the user to request a commit.

### 2. TypeScript Standards

- **Strict Typing:** **ALWAYS** use TypeScript. **NEVER** use JavaScript.
- **No `any`:** **NEVER** use the `any` type.
- **Exports:** Prefer **Named Exports** over default exports.
- **Functions:**
  - **ALWAYS** use **Arrow Functions** unless strictly necessary.
  - **ALWAYS** name functions as **verbs**.
  - **ALWAYS** prefer **Early Returns** over deeply nested `if` statements.
  - Prioritize **Higher-Order Functions** (`map`, `filter`, `reduce`) over loops.
  - When receiving more than 2 parameters, **ALWAYS** receive an **object**.
- **Naming Conventions:**
  - **ALWAYS** prefer `interface` over `type` for objects/DTOs.
  - **ALWAYS** use **kebab-case** for file names (e.g., `auth-client.ts`), except for Use Cases which use **PascalCase**.
  - **ALWAYS** use **PascalCase** for classes.
  - **ALWAYS** use **camelCase** for variables, functions, and methods.
- **Imports:** **ALWAYS** use `.js` extensions in all relative imports (e.g., `import { db } from "./lib/db.js"`).
- **Dates:** **ALWAYS** use the `dayjs` library for date manipulation and formatting.

### 3. Fastify: API Routes

- **REST Principles:** **ALWAYS** follow REST principles (e.g., `GET /workout-plans`, `POST /workout-plans`).
- **Location:** Create route files in `src/routes/`.
- **Validação:** Use `fastify-type-provider-zod` with **Zod v4**.
- **Schemas:**
  - Define creation and update schemas in `src/schemas/index.ts`.
  - **ALWAYS** use `z.enum(WeekDay)` (imported from `../generated/prisma/enums.js`) for weekday fields. **NEVER** use `z.string()`.
  - **ALWAYS** use `ErrorSchema` from `src/schemas/index.ts` for error responses.
  - **ALWAYS** include `tags` and `summary` in the route schema for Swagger/OpenAPI documentation.
- **Logic Separation:** Routes **NEVER** contain business logic. They must:
  1. Validate data (Zod).
  2. Handle authentication (use `auth.api.getSession` from `src/lib/auth.ts`).
  3. Instantiate and call a Use Case.
  4. Handle errors thrown by the Use Case.

### 4. Use Cases

- **Business Logic:** 100% of business rules must be inside a Use Case.
- **Location:** Create Use Cases in `src/useCases/`.
- **Structure:**
  - Must be **classes** with a single `execute` method.
  - Must be named as **verbs** (e.g., `CreateWorkoutPlan`).
- **DTOs:**
  - Input: **ALWAYS** use an `InputDto` interface defined in the same file.
  - Output: **ALWAYS** use an `OutputDto` interface defined in the same file.
  - **NEVER** return the Prisma model directly; map the result to the `OutputDto`.
- **Database:** Call `prisma` directly (imported from `src/lib/db.js`). Do **NOT** use repositories.
- **Transactions:** Complex operations involving multiple writes must be wrapped in `prisma.$transaction(async (tx) => { ... })`.
- **Error Handling:** **NEVER** handle errors (try/catch) inside Use Cases. Use Cases throw custom errors from `src/errors/index.ts`.

### 5. Zod (v4)

- **Rigorous Validation:** Use specific validators like `.uuid()`, `.email()`, `.url()`.
- **ISO Dates:** **ALWAYS** use Zod's ISO date validators (e.g., `.datetime()`) instead of manual regex.
- **Required Strings:** **ALWAYS** use `.trim().min(1)` for required string fields.

---

## Reference Examples

### Route Example (src/routes/workoutPlan.ts)

```ts
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/auth.js";
import { ErrorSchema, WorkoutPlanSchema } from "../schemas/index.js";
import { CreateWorkoutPlan } from "../useCases/CreateWorkoutPlan.js";

export const workoutPlanRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
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
          name: request.body.name,
          workoutDays: request.body.workoutDays,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: "NOT_FOUND_ERROR" });
        }
        return reply
          .status(500)
          .send({
            error: "Internal server error",
            code: "INTERNAL_SERVER_ERROR",
          });
      }
    },
  });
};
```

### Use Case Example (src/useCases/CreateWorkoutPlan.ts)

```ts
import { NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRestDay: boolean;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

interface OutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRestDay: boolean;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    return prisma.$transaction(async (tx) => {
      const workoutPlan = await tx.workoutPlan.create({
        data: {
          id: crypto.randomUUID(),
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((day) => ({
              name: day.name,
              weekDay: day.weekDay,
              isRestDay: day.isRestDay,
              estimatedDurationInSeconds: day.estimatedDurationInSeconds,
              exercises: {
                create: day.exercises.map((ex) => ({
                  name: ex.name,
                  order: ex.order,
                  sets: ex.sets,
                  reps: ex.reps,
                  restTimeInSeconds: ex.restTimeInSeconds,
                })),
              },
            })),
          },
        },
        include: { workoutDays: { include: { exercises: true } } },
      });

      return {
        id: workoutPlan.id,
        name: workoutPlan.name,
        workoutDays: workoutPlan.workoutDays.map((day) => ({
          name: day.name,
          weekDay: day.weekDay,
          isRestDay: day.isRestDay,
          estimatedDurationInSeconds: day.estimatedDurationInSeconds,
          exercises: day.exercises.map((ex) => ({
            order: ex.order,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            restTimeInSeconds: ex.restTimeInSeconds,
          })),
        })),
      };
    });
  }
}
```
