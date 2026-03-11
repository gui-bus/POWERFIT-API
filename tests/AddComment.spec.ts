import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { notificationEvents } from "../src/lib/events.js";
import { AddComment } from "../src/useCases/AddComment.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback(prisma)),
    activity: { findUnique: vi.fn() },
    comment: { create: vi.fn() },
    notification: { create: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    xpTransaction: { findFirst: vi.fn(), create: vi.fn() },
    achievement: { count: vi.fn(), findMany: vi.fn() },
    userAchievement: { findMany: vi.fn(), create: vi.fn() },
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

describe("AddComment Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.achievement.findMany as any).mockResolvedValue([]);
    (prisma.userAchievement.findMany as any).mockResolvedValue([]);
  });

  it("should add a comment and notify the owner", async () => {
    const userId = "user-1";
    const activityId = "act-1";
    const ownerId = "user-2";

    (prisma.activity.findUnique as any).mockResolvedValue({
      id: activityId,
      userId: ownerId,
    });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: userId,
      xp: 0,
      level: 1,
    });
    (prisma.notification.create as any).mockResolvedValue({
      id: "notif-1",
      recipientId: ownerId,
    });

    const addComment = new AddComment();
    await addComment.execute({ userId, activityId, content: "Boa!" });

    expect(prisma.comment.create).toHaveBeenCalled();
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(notificationEvents.emit).toHaveBeenCalledWith(
      "new-notification",
      expect.anything(),
    );
  });

  it("should not notify if user comments on their own activity", async () => {
    const userId = "user-1";
    const activityId = "act-1";

    (prisma.activity.findUnique as any).mockResolvedValue({
      id: activityId,
      userId,
    });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: userId,
      xp: 0,
      level: 1,
    });

    const addComment = new AddComment();
    await addComment.execute({ userId, activityId, content: "Auto elogio" });

    expect(prisma.comment.create).toHaveBeenCalled();
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });
});
