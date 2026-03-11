import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError } from "../src/errors/index.js";
import { prisma } from "../src/lib/db.js";
import { MarkNotificationAsRead } from "../src/useCases/MarkNotificationAsRead.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    notification: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("MarkNotificationAsRead Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mark notification as read if user is the recipient", async () => {
    const userId = "user-1";
    const notificationId = "notif-1";

    (prisma.notification.findUnique as any).mockResolvedValue({
      id: notificationId,
      recipientId: userId,
    });

    const markAsRead = new MarkNotificationAsRead();
    await markAsRead.execute({ userId, notificationId });

    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: notificationId },
      data: { isRead: true },
    });
  });

  it("should throw NotFoundError if user is not the recipient", async () => {
    const userId = "user-1";
    const notificationId = "notif-1";

    (prisma.notification.findUnique as any).mockResolvedValue({
      id: notificationId,
      recipientId: "other-user",
    });

    const markAsRead = new MarkNotificationAsRead();
    await expect(
      markAsRead.execute({ userId, notificationId }),
    ).rejects.toThrow(NotFoundError);
  });
});
