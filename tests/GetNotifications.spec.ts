import { describe, expect, it, vi } from "vitest";
import { GetNotifications } from "../src/useCases/GetNotifications.js";
import { prisma } from "../src/lib/db.js";
import { NotificationType } from "../src/generated/prisma/enums.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetNotifications Use Case Pagination", () => {
  it("should return nextCursor when results exceed limit", async () => {
    const userId = "user-123";
    const limit = 2;

    const mockNotifications = [
      { id: "1", type: NotificationType.FRIEND_REQUEST, isRead: false, createdAt: new Date(), activityId: null, achievementId: null, content: null, sender: null, achievement: null },
      { id: "2", type: NotificationType.FRIEND_REQUEST, isRead: false, createdAt: new Date(), activityId: null, achievementId: null, content: null, sender: null, achievement: null },
      { id: "3", type: NotificationType.FRIEND_REQUEST, isRead: false, createdAt: new Date(), activityId: null, achievementId: null, content: null, sender: null, achievement: null },
    ];

    (prisma.notification.findMany as any).mockResolvedValue(mockNotifications);

    const getNotifications = new GetNotifications();
    const result = await getNotifications.execute({ userId, limit });

    // Verificações
    expect(result.notifications).toHaveLength(2); // Deve retornar apenas o limite
    expect(result.nextCursor).toBe("3"); // O 3º item deve ser o cursor
  });

  it("should return null nextCursor when results are within limit", async () => {
    const userId = "user-123";
    const limit = 10;

    const mockNotifications = [
      { id: "1", type: NotificationType.FRIEND_REQUEST, isRead: false, createdAt: new Date(), activityId: null, achievementId: null, content: null, sender: null, achievement: null },
    ];

    (prisma.notification.findMany as any).mockResolvedValue(mockNotifications);

    const getNotifications = new GetNotifications();
    const result = await getNotifications.execute({ userId, limit });

    expect(result.notifications).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it("should not use skip 1 when cursor is provided (current correct behavior)", async () => {
    const userId = "user-123";
    const cursor = "some-id";

    const getNotifications = new GetNotifications();
    await getNotifications.execute({ userId, cursor });

    expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
      cursor: { id: cursor },
      skip: 0, // Garantindo que não pulamos o item do cursor
    }));
  });
});
