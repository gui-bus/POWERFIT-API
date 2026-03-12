# PowerFIT API 🚀

**PowerFIT API** is a high-performance backend service for a modern fitness ecosystem. It manages workout plans, real-time sessions, gamification (XP, challenges, achievements), and social interactions (feed, friends, notifications).

Built with a focus on type safety, clean architecture, and developer experience.

---

## 🛠 Tech Stack

- **Runtime:** [Node.js v24+](https://nodejs.org/)
- **Framework:** [Fastify v5](https://fastify.io/) with [Zod Type Provider](https://github.com/lucadake/fastify-type-provider-zod)
- **Language:** [TypeScript v5](https://www.typescriptlang.org/)
- **ORM:** [Prisma v7](https://www.prisma.io/)
- **Authentication:** [Better-Auth v1.4](https://www.better-auth.com/)
- **Documentation:** [Swagger](https://github.com/fastify/fastify-swagger) + [Scalar](https://scalar.com/)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) (Gemini 2.0)
- **Storage:** [UploadThing](https://uploadthing.com/)
- **Database:** [PostgreSQL v16](https://www.postgresql.org/)
- **Testing:** [Vitest](https://vitest.dev/)

---

## ✨ Key Features

- **Workout Management:** Create custom plans, track real-time sessions, and history.
- **Gamification:** XP system, global/friend rankings, streaks, and unlockable achievements.
- **Social Ecosystem:** Activity feed with Powerups (likes), comments, friend requests, and real-time notifications (SSE).
- **AI Personal Trainer:** Interactive chat to generate plans and update training data using Google Gemini.
- **Progress Tracking:** Personal Records (PRs) and body measurement history (Weight, BF%, etc.).

---

## 🚀 Getting Started

### Prerequisites

- **pnpm** (v10+)
- **Docker** & **Docker Compose**
- **Node.js** (v24+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/fit-app-api.git
   cd fit-app-api
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   Fill in the required variables (Database URL, Auth Secrets, Google AI API Key, etc.).

4. **Infrastructure:**
   ```bash
   docker compose up -d
   ```

5. **Database Initialization:**
   ```bash
   pnpm prisma db push
   pnpm prisma generate
   ```

6. **Run Development Server:**
   ```bash
   pnpm dev
   ```

---

## 🏗 Architecture

The project follows a **Use-Case Driven Clean Architecture**:

- **`src/routes/`**: API endpoints, validation (Zod), and authentication middleware. No business logic allowed here.
- **`src/modules/*/use-cases/`**: 100% of business rules. Each use case is a single-responsibility class.
- **`src/schemas/`**: Centralized Zod schemas for request/response validation.
- **`src/lib/`**: External library configurations (DB, Auth, AI, Events).
- **`src/errors/`**: Custom application error handling.

---

## 📝 API Documentation

Once the server is running, you can access the interactive documentation at:

- **Scalar (Modern UI):** `http://localhost:8080/`
- **Swagger JSON:** `http://localhost:8080/swagger.json`

The documentation is automatically generated from Zod schemas, ensuring it's always up-to-date with the code.

---

## 🛠 Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts development server with hot-reload (`tsx`) |
| `pnpm build` | Generates Prisma client and compiles TypeScript |
| `pnpm start` | Runs the compiled production build |
| `pnpm test` | Runs the full test suite with Vitest |
| `pnpm prisma studio` | Opens a GUI to explore the database |
| `pnpm prisma db push` | Syncs schema changes to the database |

---

## 📏 Development Rules

- **Conventional Commits:** All commits must follow the standard (e.g., `feat:`, `fix:`, `docs:`).
- **Strict Typing:** No `any`. Use interfaces for DTOs.
- **Named Exports:** Prefer named exports over default exports.
- **Clean Code:** 
  - Functions should be verbs and use arrow syntax.
  - Use Early Returns to reduce nesting.
  - No single-line comments (`//`). Code must be self-explanatory.
- **Date Management:** Always use `dayjs`.

---

## 📄 License

This project is licensed under the **ISC License**.
