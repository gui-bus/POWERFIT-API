import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { notificationEvents } from "../src/lib/events.js";
import { AcceptFriendRequest } from "../src/modules/social/use-cases/AcceptFriendRequest.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    friendship: {
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn()
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
      create: vi.fn()
    },
    workoutSession: { count: vi.fn() },
    powerup: { count: vi.fn() }
  },
}));

vi.mock("../src/lib/events.js", () => ({
  notificationEvents: {
    emit: vi.fn(),
  },
}));

vi.mock("../src/lib/gamification.js", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    ensureInitialAchievements: vi.fn(),
  };
});

describe("AcceptFriendRequest Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    (prisma.notification.create as any).mockResolvedValue({
      id: "notif-1",
    });

    const acceptFriendRequest = new AcceptFriendRequest(prisma as any);
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
