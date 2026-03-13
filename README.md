# PowerFIT API 🚀

**PowerFIT API** is a high-performance, industrial-grade backend service for a modern fitness ecosystem. It orchestrates complex workout management, real-time social interactions, advanced gamification, and AI-driven coaching.

Designed with **Clean Architecture** principles, the system ensures maximum maintainability, security, and scalability.

---

## 📖 In-Depth Documentation

Explore specific modules and technical decisions:

- [🏗 **Architecture & Design Patterns**](./docs/architecture.md) - Use-cases, DTOs, and project structure.
- [🗄️ **Database Schema**](./docs/database.md) - Prisma models and entity relationships.
- [🛡️ **Security & Authentication**](./docs/security.md) - RBAC, Helmet, Rate Limiting, and Session Management.
- [🎖️ **Gamification Logic**](./docs/gamification.md) - XP systems, Streaks, Challenges, and Rankings.
- [🤖 **AI Personal Trainer**](./docs/ai.md) - Integration with Google Gemini and Function Calling.
- [🖥️ **Admin & Governance**](./docs/admin.md) - Moderation tools and system-wide metrics.

---

## ✨ Key Capabilities

- **Workout Ecosystem:** Real-time session tracking, custom plan builder, and exercise history.
- **Social Feed:** Activity stream with "Powerups", comments, and friend discovery.
- **Gamification Engine:** RPG-style leveling, unlockable achievements, and competitive challenges.
- **AI Integration:** Automated workout generation and performance analysis via LLM.
- **Admin Dashboard:** Full-featured governance tools for user moderation and content curation.
- **Real-time:** SSE-based notification system for instant feedback.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js v24+ (ESM) |
| **Framework** | Fastify v5 (Type-safe with Zod) |
| **Database** | PostgreSQL v16 + Prisma v7 |
| **Auth** | Better-Auth v1.4 |
| **AI** | Vercel AI SDK (Google Gemini 2.0) |
| **Testing** | Vitest (140+ Unit Tests) |
| **Observability**| Sentry + Structured Logging (Pino) |
| **Security** | Helmet + Rate Limit |

---

## 🚀 Quick Start

### Prerequisites
- **pnpm** (v10+)
- **Docker**
- **Node.js** (v24+)

### Installation

1. **Setup:**
   ```bash
   git clone https://github.com/your-username/fit-app-api.git
   pnpm install
   cp .env.example .env
   ```

2. **Spin up Infrastructure:**
   ```bash
   docker compose up -d
   pnpm prisma db push
   ```

3. **Development:**
   ```bash
   pnpm dev
   ```

---

## 📝 API Documentation

Access the interactive API explorer (Powered by Scalar):
- **URL:** `http://localhost:8080/`
- **Spec:** `http://localhost:8080/swagger.json`

---

## 🛠 Maintenance & Quality

| Command | Description |
| :--- | :--- |
| `pnpm test` | Run 140+ unit and integration tests |
| `pnpm build` | Compile TypeScript and generate Prisma client |
| `pnpm prisma studio` | Visual database manager |

---

## 📄 License

This project is licensed under the **ISC License**.
