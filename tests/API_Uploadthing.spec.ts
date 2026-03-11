import { beforeAll, describe, expect, it, vi } from "vitest";

import { app } from "../src/index.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
    },
  },
}));

describe("API Uploadthing Endpoints", () => {
  beforeAll(async () => {
    await app.ready();
  });

  it("GET /api/uploadthing should return info about the router", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/uploadthing",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toContainEqual(
      expect.objectContaining({ slug: "profileImage" }),
    );
    expect(body).toContainEqual(
      expect.objectContaining({ slug: "workoutImage" }),
    );
  });

  it("POST /api/uploadthing should return 403 if no token is provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/uploadthing",
      query: {
        slug: "profileImage",
        actionType: "upload",
      },
      payload: {
        files: [{ name: "test.jpg", size: 1024, type: "image/jpeg" }],
      },
    });

    expect(response.statusCode).toBe(403);
  });
});
