# Architecture & Design Patterns

The PowerFIT API is built using a **Use-Case Driven Clean Architecture**. This approach ensures that business logic is isolated, highly testable, and independent of the framework (Fastify) or the database (Prisma).

## 🏗 Directory Structure

- `src/index.ts`: The entry point. Configures Fastify, Sentry, and registers routes.
- `src/modules/`: Organized by domain (User, Workout, Social, Gamification, AI).
  - `*/use-cases/`: Contains the actual business logic. Each file is a single class with an `execute` method.
- `src/routes/`: Defines API endpoints. Responsible for:
  - Input validation (Zod).
  - Authentication checks.
  - Instantiating and calling Use Cases.
  - Sending responses.
- `src/schemas/`: Centralized Zod schemas for consistency across routes and documentation.
- `src/lib/`: Shared library configurations (Database client, Auth, Events).
- `src/generated/`: Prisma generated client and enums.

## 🧱 Key Patterns

### 1. Use Case Pattern
Every business action is an isolated class.
- **Input:** Always an `InputDto` interface.
- **Output:** Always an `OutputDto` interface.
- **Rules:** 100% of business rules must live here. No database logic should leak into routes.

### 2. DTO (Data Transfer Objects)
We never return Prisma models directly to the client. We map database models to specific `OutputDto`s to:
- Hide sensitive fields.
- Format dates (using `dayjs`).
- Shape data specifically for the frontend's needs.

### 3. Centralized Error Handling
Uses a custom `AppError` class. Errors are caught by a global handler in `index.ts`, ensuring consistent JSON responses for the frontend.

### 4. Event-Driven Architecture
For cross-module communication (e.g., a Workout completion triggering a Social Notification), we use a simple `EventEmitter` in `src/lib/events.ts`. This keeps modules decoupled.
