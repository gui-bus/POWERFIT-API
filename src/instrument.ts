import * as Sentry from "@sentry/node";

import { env } from "./lib/env.js";

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  enabled: !!env.SENTRY_DSN && env.NODE_ENV === "production",
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
});
