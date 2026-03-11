import { describe, expect, it, vi, beforeAll } from "vitest";
import { app } from "../src/index.js";
import { auth } from "../src/lib/auth.js";

vi.mock("../src/lib/auth.js", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("ai", async () => {
  return {
    convertToModelMessages: vi.fn().mockResolvedValue([]),
    stepCountIs: vi.fn(),
    streamText: vi.fn().mockReturnValue({
      toUIMessageStreamResponse: () => ({
        status: 200,
        headers: new Map([["Content-Type", "text/plain"]]),
        body: null,
      }),
    }),
    tool: vi.fn(),
  };
});

describe("API AI Endpoints", () => {
  beforeAll(async () => {
    await app.ready();
  });

  it("POST /ai should require authentication", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);
    const response = await app.inject({
      method: "POST",
      url: "/ai/",
      payload: { messages: [] },
    });
    expect(response.statusCode).toBe(401);
  });

  it("POST /ai should return 200 if authenticated", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    const response = await app.inject({
      method: "POST",
      url: "/ai/",
      payload: {
        messages: [{ id: "1", role: "user", content: "Olá" }],
      },
    });
    expect(response.statusCode).toBe(200);
  });
});
