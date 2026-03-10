import { describe, expect, it, vi, beforeEach } from "vitest";
import { GetHomeData } from "../src/useCases/GetHomeData.js";
import { prisma } from "../src/lib/db.js";
import dayjs from "dayjs";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    workoutPlan: { findFirst: vi.fn() },
    workoutSession: { findMany: vi.fn() },
  },
}));

describe("GetHomeData Use Case (Streak Logic)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate correct streak for a 3-day sequence", async () => {
    const userId = "user-1";
    const today = "2026-03-10"; // Terça

    (prisma.workoutPlan.findFirst as any).mockResolvedValue(null);
    (prisma.workoutSession.findMany as any).mockImplementation(({ where }: any) => {
      // Se for a busca de sessões da semana (tem startedAt no where)
      if (where.startedAt) return Promise.resolve([]);
      
      // Se for a busca de todas as concluídas (tem completedAt no where)
      return Promise.resolve([
        { startedAt: dayjs.utc("2026-03-10").toDate() },
        { startedAt: dayjs.utc("2026-03-09").toDate() },
        { startedAt: dayjs.utc("2026-03-08").toDate() },
      ]);
    });

    const getHomeData = new GetHomeData();
    const result = await getHomeData.execute({ userId, date: today });

    expect(result.workoutStreak).toBe(3);
  });

  it("should return 0 streak if no workouts done", async () => {
    const userId = "user-1";
    (prisma.workoutSession.findMany as any).mockResolvedValue([]);

    const getHomeData = new GetHomeData();
    const result = await getHomeData.execute({ userId, date: "2026-03-10" });

    expect(result.workoutStreak).toBe(0);
  });
});
