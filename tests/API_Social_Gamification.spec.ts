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

describe("API Social & Gamification Endpoints", () => {
  beforeAll(async () => {
    await app.ready();
  });

  const mockSession = { user: { id: "user-1", name: "User 1" } };

  describe("Friendships (/friendships)", () => {
    it("POST / should require a code or email", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockSession);
      const response = await app.inject({
        method: "POST",
        url: "/friendships/",
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });

    it("GET /requests should return 401 if no session", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const response = await app.inject({
        method: "GET",
        url: "/friendships/requests",
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("Gamification (/gamification)", () => {
    it("GET /ranking should require authentication", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const response = await app.inject({
        method: "GET",
        url: "/gamification/ranking",
        query: { sortBy: "XP" },
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("Stats (/stats)", () => {
    it("GET / should require authentication", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const response = await app.inject({
        method: "GET",
        url: "/stats/",
        query: { from: "2026-01-01", to: "2026-01-07" },
      });
      expect(response.statusCode).toBe(401);
    });
  });
});
