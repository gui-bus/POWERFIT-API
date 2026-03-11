import { describe, expect, it, vi } from "vitest";

import { NotFoundError } from "../src/errors/index.js";
import { User } from "../src/generated/prisma/models.js";
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
  it("should return user data if exists", async () => {
    const userId = "user-1";
    const mockUser = {
      id: userId,
      name: "User Test",
      email: "test@example.com",
      image: null,
      friendCode: "#ABC1234",
      xp: 100,
      level: 1,
      isPublicProfile: true,
      showStats: true,
    } as any as User;

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const getMe = new GetMe(prisma as any);
    const result = await getMe.execute({ userId });

    expect(result.email).toBe("test@example.com");
    expect(result.friendCode).toBe("#ABC1234");
  });

  it("should generate a friend code if user doesn't have one", async () => {
    const userId = "user-1";
    const mockUser = {
      id: userId,
      friendCode: null,
      email: "test@test.com",
    } as any as User;

    (prisma.user.findUnique as any)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(null);

    (prisma.user.update as any).mockResolvedValue({
      ...mockUser,
      friendCode: "#NEWCODE",
    } as any as User);

    const getMe = new GetMe(prisma as any);
    const result = await getMe.execute({ userId });

    expect(result.friendCode).toBeDefined();
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it("should throw NotFoundError if user does not exist", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const getMe = new GetMe(prisma as any);

    await expect(getMe.execute({ userId: "none" })).rejects.toThrow(
      NotFoundError,
    );
  });
});
