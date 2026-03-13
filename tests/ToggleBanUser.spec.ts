import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { ToggleBanUser } from "../src/modules/user/use-cases/ToggleBanUser.js";
import { AppError } from "../src/errors/index.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("ToggleBanUser Use Case", () => {
  it("should toggle ban status of a user", async () => {
    const mockUser = { id: "u1", role: "USER", isBanned: false };
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.user.update as any).mockResolvedValue({ ...mockUser, isBanned: true });

    const toggleBanUser = new ToggleBanUser();
    const result = await toggleBanUser.execute({ targetUserId: "u1" });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { isBanned: true },
    });
    expect(result.isBanned).toBe(true);
  });

  it("should throw error if trying to ban an admin", async () => {
    const mockAdmin = { id: "a1", role: "ADMIN", isBanned: false };
    (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);

    const toggleBanUser = new ToggleBanUser();
    await expect(toggleBanUser.execute({ targetUserId: "a1" })).rejects.toThrow(AppError);
  });
});
