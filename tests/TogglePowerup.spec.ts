import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { notificationEvents } from "../src/lib/events.js";
import { TogglePowerup } from "../src/useCases/TogglePowerup.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    activity: { findUnique: vi.fn() },
    friendship: { findFirst: vi.fn() },
    powerup: { findUnique: vi.fn(), delete: vi.fn(), create: vi.fn(), count: vi.fn() },
    notification: { create: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
    achievement: {
      count: vi.fn().mockResolvedValue(10),
      findMany: vi.fn().mockResolvedValue([]),
    },
    userAchievement: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
  },
}));

vi.mock("../src/lib/events.js", () => ({
  notificationEvents: { emit: vi.fn() },
}));

vi.mock("../src/lib/gamification.js", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    ensureInitialAchievements: vi.fn(),
  };
});

describe("TogglePowerup Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create powerup and notify if it doesn't exist", async () => {
    const userId = "user-1";
    const friendId = "user-2";
    const activityId = "act-1";

    (prisma.activity.findUnique as any).mockResolvedValue({
      id: activityId,
      userId: friendId,
    });
    (prisma.friendship.findFirst as any).mockResolvedValue({
      status: "ACCEPTED",
    });
    (prisma.powerup.findUnique as any).mockResolvedValue(null);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: userId,
      xp: 0,
      level: 1,
    });
    (prisma.notification.create as any).mockResolvedValue({
      id: "notif-1",
      recipientId: friendId,
    });

    const togglePowerup = new TogglePowerup();
    await togglePowerup.execute({ userId, activityId });

    expect(prisma.powerup.create).toHaveBeenCalled();
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(notificationEvents.emit).toHaveBeenCalledWith(
      "new-notification",
      expect.anything(),
    );
  });

  it("should remove powerup if it already exists", async () => {
    const userId = "user-1";
    const activityId = "act-1";

    (prisma.activity.findUnique as any).mockResolvedValue({
      id: activityId,
      userId,
    });
    (prisma.powerup.findUnique as any).mockResolvedValue({ id: "pow-1" });

    const togglePowerup = new TogglePowerup();
    await togglePowerup.execute({ userId, activityId });

    expect(prisma.powerup.delete).toHaveBeenCalled();
    expect(prisma.powerup.create).not.toHaveBeenCalled();
  });

  it("should throw ForbiddenError if trying to powerup a non-friend's activity", async () => {
    const userId = "user-1";
    const strangerId = "stranger-1";
    const activityId = "act-1";

    (prisma.activity.findUnique as any).mockResolvedValue({
      id: activityId,
      userId: strangerId,
    });
    (prisma.friendship.findFirst as any).mockResolvedValue(null);

    const togglePowerup = new TogglePowerup();
    await expect(togglePowerup.execute({ userId, activityId })).rejects.toThrow(
      ForbiddenError,
    );
  });
});
