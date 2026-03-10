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

describe("API Feed & Notifications Endpoints", () => {
  beforeAll(async () => {
    await app.ready();
  });

  const mockSession = { user: { id: "user-1" } };

  describe("Feed (/feed)", () => {
    it("POST /activities/:id/powerup should require authentication", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const response = await app.inject({
        method: "POST",
        url: "/feed/activities/d62ed5b7-2266-497c-9a99-94d78a57798d/powerup"
      });
      expect(response.statusCode).toBe(401);
    });

    it("POST /activities/:id/comments should validate body content", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockSession);
      const response = await app.inject({
        method: "POST",
        url: "/feed/activities/d62ed5b7-2266-497c-9a99-94d78a57798d/comments",
        payload: { content: "" }
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Notifications (/notifications)", () => {
    it("PATCH /:id/read should require authentication", async () => {
      (auth.api.getSession as any).mockResolvedValue(null);
      const response = await app.inject({
        method: "PATCH",
        url: "/notifications/d62ed5b7-2266-497c-9a99-94d78a57798d/read"
      });
      expect(response.statusCode).toBe(401);
    });

    it("PATCH /read-all should return 204 on success", async () => {
      (auth.api.getSession as any).mockResolvedValue(mockSession);
      const response = await app.inject({
        method: "PATCH",
        url: "/notifications/read-all"
      });
      expect(response.statusCode).toBe(204);
    });
  });
});
