import { describe, expect, it, vi, beforeEach } from "vitest";
import { SearchUsers } from "../src/useCases/SearchUsers.js";
import { prisma } from "../src/lib/db.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

describe("SearchUsers Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return users matching query and identify relationship status", async () => {
    const userId = "me";
    (prisma.user.findMany as any).mockResolvedValue([
      { 
        id: "user-1", 
        name: "John Doe", 
        friends: [{ userId: "me", status: "ACCEPTED" }],
        friendOf: []
      },
      { 
        id: "user-2", 
        name: "Jane Smith", 
        friends: [],
        friendOf: [{ userId: "me", status: "PENDING" }]
      }
    ]);

    const searchUsers = new SearchUsers();
    const result = await searchUsers.execute({ userId, query: "John" });

    expect(result).toHaveLength(2);
    expect(result[0].isFriend).toBe(true);
    expect(result[1].isPending).toBe(true);
  });
});
