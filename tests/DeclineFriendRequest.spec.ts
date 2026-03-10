import { describe, expect, it, vi, beforeEach } from "vitest";
import { DeclineFriendRequest } from "../src/useCases/DeclineFriendRequest.js";
import { prisma } from "../src/lib/db.js";
import { NotFoundError } from "../src/errors/index.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    friendship: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      deleteMany: vi.fn(),
    },
  },
}));

describe("DeclineFriendRequest Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should decline (delete) a friendship request", async () => {
    const userId = "user-recipient";
    const requestId = "request-1";

    (prisma.friendship.findFirst as any).mockResolvedValue({ id: requestId, friendId: userId });

    const declineReq = new DeclineFriendRequest();
    await declineReq.execute({ userId, requestId });

    expect(prisma.friendship.delete).toHaveBeenCalledWith({
      where: { id: requestId }
    });
  });

  it("should throw NotFoundError if request does not belong to user", async () => {
    (prisma.friendship.findFirst as any).mockResolvedValue(null);
    const declineReq = new DeclineFriendRequest();
    await expect(declineReq.execute({ userId: "wrong-user", requestId: "any" })).rejects.toThrow(NotFoundError);
  });
});
