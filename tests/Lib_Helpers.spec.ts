import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { createAndEmitNotification, createAndEmitNotifications } from "../src/lib/notifications.js";
import { areFriends, getFriendship, isFriendshipPending } from "../src/lib/social.js";
import { notificationEvents } from "../src/lib/events.js";
import { checkWorkoutPlanOwnership } from "../src/lib/workout.js";
import { ForbiddenError, NotFoundError } from "../src/errors/index.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    friendship: { findFirst: vi.fn() },
    notification: { create: vi.fn() },
    workoutPlan: { findUnique: vi.fn() },
  },
}));

vi.mock("../src/lib/events.js", () => ({
  notificationEvents: { emit: vi.fn() },
}));

describe("Lib Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("social.ts", () => {
    it("should return friendship from getFriendship", async () => {
      (prisma.friendship.findFirst as any).mockResolvedValue({ id: "f1", status: "ACCEPTED" });
      const result = await getFriendship("u1", "u2");
      expect(result?.id).toBe("f1");
    });

    it("should return true for areFriends if status is ACCEPTED", async () => {
      (prisma.friendship.findFirst as any).mockResolvedValue({ id: "f1", status: "ACCEPTED" });
      const result = await areFriends("u1", "u2");
      expect(result).toBe(true);
    });

    it("should return false for areFriends if status is PENDING", async () => {
      (prisma.friendship.findFirst as any).mockResolvedValue({ id: "f1", status: "PENDING" });
      const result = await areFriends("u1", "u2");
      expect(result).toBe(false);
    });

    it("should return true for isFriendshipPending if status is PENDING", async () => {
      (prisma.friendship.findFirst as any).mockResolvedValue({ id: "f1", status: "PENDING" });
      const result = await isFriendshipPending("u1", "u2");
      expect(result).toBe(true);
    });
  });

  describe("notifications.ts", () => {
    it("should create and emit notification", async () => {
      const mockNotif = { id: "n1", recipientId: "r1" };
      (prisma.notification.create as any).mockResolvedValue(mockNotif);
      
      await createAndEmitNotification({ recipientId: "r1", type: "LEVEL_UP" });
      
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(notificationEvents.emit).toHaveBeenCalledWith("new-notification", mockNotif);
    });

    it("should create and emit multiple notifications", async () => {
      const mockNotif = { id: "n1", recipientId: "r1" };
      (prisma.notification.create as any).mockResolvedValue(mockNotif);
      
      await createAndEmitNotifications([{ recipientId: "r1", type: "LEVEL_UP" }, { recipientId: "r2", type: "LEVEL_UP" }]);
      
      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
      expect(notificationEvents.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe("workout.ts", () => {
    it("should return plan if owned by user", async () => {
      (prisma.workoutPlan.findUnique as any).mockResolvedValue({ id: "p1", userId: "u1" });
      const result = await checkWorkoutPlanOwnership({ workoutPlanId: "p1", userId: "u1" });
      expect(result.id).toBe("p1");
    });

    it("should throw NotFoundError if plan does not exist", async () => {
      (prisma.workoutPlan.findUnique as any).mockResolvedValue(null);
      await expect(checkWorkoutPlanOwnership({ workoutPlanId: "p1", userId: "u1" })).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if plan is not owned by user", async () => {
      (prisma.workoutPlan.findUnique as any).mockResolvedValue({ id: "p1", userId: "u2" });
      await expect(checkWorkoutPlanOwnership({ workoutPlanId: "p1", userId: "u1" })).rejects.toThrow(ForbiddenError);
    });
  });
});
