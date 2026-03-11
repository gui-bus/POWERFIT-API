import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { GetStats } from "../src/useCases/GetStats.js";

dayjs.extend(utc);

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutSession: {
      findMany: vi.fn(),
    },
  },
}));

describe("GetStats Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate correct stats including volume and streak", async () => {
    const userId = "user-1";
    const from = "2026-03-01";
    const to = "2026-03-10";

    const mockSessions = [
      {
        id: "sess-1",
        startedAt: dayjs.utc("2026-03-05T10:00:00Z").toDate(),
        completedAt: dayjs.utc("2026-03-05T11:00:00Z").toDate(),
        workoutDay: { isRestDay: false },
        sets: [
          { weightInGrams: 10000, reps: 10 },
          { weightInGrams: 12000, reps: 8 },
        ],
      },
      {
        id: "sess-2",
        startedAt: dayjs.utc("2026-03-06T10:00:00Z").toDate(),
        completedAt: dayjs.utc("2026-03-06T10:30:00Z").toDate(),
        workoutDay: { isRestDay: true },
        sets: [],
      },
    ];

    (prisma.workoutSession.findMany as any)
      .mockResolvedValueOnce(mockSessions)
      .mockResolvedValueOnce([
        { startedAt: dayjs.utc("2026-03-10T10:00:00Z").toDate() },
        { startedAt: dayjs.utc("2026-03-09T10:00:00Z").toDate() },
        { startedAt: dayjs.utc("2026-03-08T10:00:00Z").toDate() },
      ]);

    const getStats = new GetStats();
    const result = await getStats.execute({ userId, from, to });

    expect(result.completedWorkoutsCount).toBe(1);
    expect(result.completedRestDays).toBe(1);
    expect(result.totalTimeInSeconds).toBe(3600 + 1800);
    expect(result.totalVolumeInGrams).toBe(10000 * 10 + 12000 * 8);
    expect(result.workoutStreak).toBe(3);
  });

  it("should return zero stats if no sessions found", async () => {
    (prisma.workoutSession.findMany as any).mockResolvedValue([]);

    const getStats = new GetStats();
    const result = await getStats.execute({
      userId: "user-1",
      from: "2026-03-01",
      to: "2026-03-10",
    });

    expect(result.completedWorkoutsCount).toBe(0);
    expect(result.totalVolumeInGrams).toBe(0);
    expect(result.workoutStreak).toBe(0);
  });
});
