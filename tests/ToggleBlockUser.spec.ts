import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { ToggleBlockUser } from "../src/modules/social/use-cases/ToggleBlockUser.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    block: {
      findFirst: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    friendship: {
      deleteMany: vi.fn(),
    },
  },
}));

describe("ToggleBlockUser Use Case", () => {
  it("should unblock a user if already blocked", async () => {
    const userId = "u1";
    const targetUserId = "u2";
    const mockBlock = { id: "b1", blockerId: userId, blockedId: targetUserId };

    (prisma.block.findFirst as any).mockResolvedValue(mockBlock);

    const toggleBlockUser = new ToggleBlockUser();
    const result = await toggleBlockUser.execute({ userId, targetUserId });

    expect(prisma.block.delete).toHaveBeenCalledWith({ where: { id: "b1" } });
    expect(result.isBlocked).toBe(false);
  });

  it("should block a user and remove friendships if not blocked", async () => {
    const userId = "u1";
    const targetUserId = "u2";

    (prisma.block.findFirst as any).mockResolvedValue(null);

    const toggleBlockUser = new ToggleBlockUser();
    const result = await toggleBlockUser.execute({ userId, targetUserId });

    expect(prisma.block.create).toHaveBeenCalledWith({
      data: { blockerId: userId, blockedId: targetUserId },
    });
    expect(prisma.friendship.deleteMany).toHaveBeenCalled();
    expect(result.isBlocked).toBe(true);
  });
});
