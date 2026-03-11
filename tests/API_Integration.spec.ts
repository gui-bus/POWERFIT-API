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

describe("API Integration Tests", () => {
  beforeAll(async () => {
    await app.ready();
  });

  describe("GET /feed", () => {
    it("should return 401 if not authenticated", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const response = await app.inject({ method: "GET", url: "/feed/" });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /notifications", () => {
    it("should return 401 if not authenticated", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const response = await app.inject({
        method: "GET",
        url: "/notifications/",
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /me", () => {
    it("should return 400 for invalid email/url in update profile", async () => {
      (auth.api.getSession as any).mockResolvedValue({
        user: { id: "user-1" },
      });
      const response = await app.inject({
        method: "PATCH",
        url: "/me",
        payload: { image: "invalid-url" },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /home", () => {
    it("should return 400 if date is missing in query", async () => {
      (auth.api.getSession as any).mockResolvedValue({
        user: { id: "user-1" },
      });
      const response = await app.inject({
        method: "GET",
        url: "/home/2026-03-10",
      });
      expect(response.statusCode).not.toBe(400);
    });
  });
});
