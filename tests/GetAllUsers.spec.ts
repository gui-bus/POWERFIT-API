import { describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/db.js";
import { GetAllUsers } from "../src/modules/user/use-cases/GetAllUsers.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("GetAllUsers Use Case", () => {
  it("should return paginated and sorted users", async () => {
    const mockUsers = [
      { id: "1", name: "User A", email: "a@test.com", image: null, role: "USER", isBanned: false, level: 1, xp: 100, createdAt: new Date() },
    ];
    
    (prisma.user.findMany as any).mockResolvedValue(mockUsers);
    (prisma.user.count as any).mockResolvedValue(1);

    const getAllUsers = new GetAllUsers();
    const result = await getAllUsers.execute({ page: 1, pageSize: 10, orderBy: "name", orderDir: "asc" });

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { name: "asc" },
    });
    expect(result.users).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });
});
