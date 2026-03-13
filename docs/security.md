# Security & Authentication

The PowerFIT API implements a multi-layered security strategy to protect user data and ensure system integrity.

## 🔑 Authentication

Powered by **Better-Auth**, the system supports:
- **Social Login:** Google OAuth integration.
- **Session Management:** Secure cookie-based sessions with cross-subdomain support.
- **Middleware:** A centralized `authenticate` middleware in `src/lib/auth-middleware.ts` validates every protected request.

## 🛡️ Authorization (RBAC)

We use **Role-Based Access Control (RBAC)** to manage permissions:
- **USER:** Default role. Access to personal data, workouts, and social features.
- **ADMIN:** Access to the Administration Dashboard and moderation tools.

The `authorize(['ADMIN'])` middleware ensures that sensitive routes are only accessible by authorized personnel.

## 🛑 Moderation

Admins have the power to:
- **Ban Users:** Suspends account access globally. Banned users receive a `403 FORBIDDEN` with code `USER_BANNED` on all requests.
- **Delete Content:** Remove any inappropriate activity or comment from the feed.

## 🕸️ Network Protection

- **Helmet:** Uses `@fastify/helmet` to set standard security headers (CSP, HSTS, X-Content-Type-Options, etc.).
- **Rate Limiting:** Protects against Brute Force and DoS attacks.
  - **Global Limit:** 100 requests per minute per IP.
- **CORS:** Strict origin validation allowing only the trusted frontend application.

## 🔍 Observability

- **Sentry:** Integrated for real-time error tracking and performance monitoring.
- **Structured Logging:** Uses `pino` for efficient, machine-readable logs.
