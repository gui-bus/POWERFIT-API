import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { MarkAllNotificationsAsRead } from "../src/useCases/MarkAllNotificationsAsRead.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    notification: {
      updateMany: vi.fn(),
    },
  },
}));

describe("MarkAllNotificationsAsRead Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mark all notifications for the specific user as read", async () => {
    const userId = "user-1";

    const markAllAsRead = new MarkAllNotificationsAsRead();
    await markAllAsRead.execute({ userId });

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  });
});
