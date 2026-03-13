import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { GetMe } from "../src/modules/user/use-cases/GetMe.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("GetMe Use Case", () => {
  it("should return user profile including role", async () => {
    const mockUser = {
      id: "u1",
      name: "Test User",
      email: "test@test.com",
      image: null,
      bio: null,
      socialLinks: {},
      friendCode: "#ABC1234",
      xp: 100,
      level: 1,
      role: "ADMIN",
      isPublicProfile: true,
      showStats: true,
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const getMe = new GetMe(prisma as any);
    const result = await getMe.execute({ userId: "u1" });

    expect(result.role).toBe("ADMIN");
    expect(result.friendCode).toBe("#ABC1234");
  });
});
