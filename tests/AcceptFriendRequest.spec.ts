import { describe, expect, it, vi } from "vitest";
import { AcceptFriendRequest } from "../src/useCases/AcceptFriendRequest.js";
import { prisma } from "../src/lib/db.js";
import { notificationEvents } from "../src/lib/events.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    friendship: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    xpTransaction: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    achievement: {
      count: vi.fn().mockResolvedValue(10),
      findMany: vi.fn().mockResolvedValue([]),
    },
    userAchievement: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("../src/lib/events.js", () => ({
  notificationEvents: {
    emit: vi.fn(),
  },
}));

describe("AcceptFriendRequest Use Case", () => {
  it("should accept request, grant XP and notify", async () => {
    const userId = "user-1";
    const requestId = "request-1";
    const requesterId = "user-2";

    (prisma.friendship.findFirst as any).mockResolvedValue({
      id: requestId,
      userId: requesterId,
      friendId: userId,
    });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: requesterId,
      xp: 0,
      level: 1,
    });
    (prisma.xpTransaction.findFirst as any).mockResolvedValue(null);
    (prisma.notification.create as any).mockResolvedValue({ id: "notif-1" });

    const acceptFriendRequest = new AcceptFriendRequest();
    await acceptFriendRequest.execute({ userId, requestId });

    expect(prisma.friendship.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });
    expect(notificationEvents.emit).toHaveBeenCalledWith(
      "new-notification",
      expect.anything(),
    );
  });
});
