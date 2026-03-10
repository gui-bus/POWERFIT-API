import { describe, expect, it, vi, beforeAll } from "vitest";
import { app } from "../src/index.js";

// Mock do Better Auth para não precisar de cookies reais nos testes de API
vi.mock("../src/lib/auth.js", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "../src/lib/auth.js";

describe("API Endpoints: Workout Plans", () => {
  beforeAll(async () => {
    await app.ready();
  });

  it("should return 401 if trying to get plans without session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/workout-plans/",
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  });

  it("should return 400 if trying to create a plan with invalid data (Zod test)", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });

    const response = await app.inject({
      method: "POST",
      url: "/workout-plans/",
      payload: {
        name: "", // Nome vazio (deve falhar no Zod)
        workoutDays: [],
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
