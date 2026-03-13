import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { UpdateUserRole } from "../src/modules/user/use-cases/UpdateUserRole.js";
import { Role } from "../src/generated/prisma/enums.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("UpdateUserRole Use Case", () => {
  it("should update user role", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: "u1" });
    const updateUserRole = new UpdateUserRole();
    await updateUserRole.execute({ targetUserId: "u1", role: Role.ADMIN });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { role: Role.ADMIN },
    });
  });
});
