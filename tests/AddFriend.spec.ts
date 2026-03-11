import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { notificationEvents } from "../src/lib/events.js";
import { AddFriend } from "../src/modules/social/use-cases/AddFriend.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    user: {
      findFirst: vi.fn(),
    },
    friendship: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    achievement: { count: vi.fn(), findMany: vi.fn() },
    userAchievement: { findMany: vi.fn(), create: vi.fn() },
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

describe("AddFriend Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.achievement.findMany as any).mockResolvedValue([]);
    (prisma.userAchievement.findMany as any).mockResolvedValue([]);
  });

  it("should create a friendship request and notify the recipient", async () => {
    const userId = "user-1";
    const friendId = "user-2";
    const friendCode = "ABC-123";

    (prisma.user.findFirst as any).mockResolvedValue({
      id: friendId,
      name: "Friend",
    });
    (prisma.friendship.findFirst as any).mockResolvedValue(null);
    (prisma.notification.create as any).mockResolvedValue({
      id: "notif-1",
      recipientId: friendId,
    });

    const addFriend = new AddFriend(prisma as any);
    const result = await addFriend.execute({ userId, codeOrEmail: friendCode });

    expect(prisma.friendship.create).toHaveBeenCalled();
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(notificationEvents.emit).toHaveBeenCalledWith(
      "new-notification",
      expect.anything(),
    );
    expect(result.id).toBe(friendId);
  });

  it("should throw error if adding yourself", async () => {
    const userId = "user-1";
    (prisma.user.findFirst as any).mockResolvedValue({ id: userId });

    const addFriend = new AddFriend(prisma as any);
    await expect(
      addFriend.execute({ userId, codeOrEmail: "any" }),
    ).rejects.toThrow("You cannot add yourself as a friend");
  });
});
