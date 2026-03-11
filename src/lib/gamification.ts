import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { PrismaClient } from "../generated/prisma/client.js";
import { prisma } from "./db.js";

dayjs.extend(utc);

type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export const XP_PER_LEVEL = 500;

export const calculateLevel = (totalXp: number): number => {
  let level = 1;
  let remainingXp = totalXp;
  let xpNeeded = XP_PER_LEVEL;

  while (remainingXp >= xpNeeded) {
    remainingXp -= xpNeeded;
    level++;
    xpNeeded = level * XP_PER_LEVEL;
  }

  return level;
};

export const calculateStreak = (completedDates: Set<string>, baseDate = dayjs.utc().startOf("day")): number => {
  let streak = 0;
  let checkDate = baseDate;

  if (!completedDates.has(checkDate.format("YYYY-MM-DD"))) {
    checkDate = checkDate.subtract(1, "day");
  }

  while (completedDates.has(checkDate.format("YYYY-MM-DD"))) {
    streak++;
    checkDate = checkDate.subtract(1, "day");
  }

  return streak;
};

export const ensureInitialAchievements = async (tx?: PrismaTransaction) => {
  const client = tx || prisma;

  const count = await client.achievement.count();
  if (count === 0) {
    await client.achievement.createMany({
      data: [
        {
          name: "Primeiro Passo",
          description: "Concluiu seu primeiro treino no Power.fit!",
          xpReward: 100,
        },
        {
          name: "Socializador",
          description:
            "Adicionou seu primeiro amigo ou enviou uma solicitação.",
          xpReward: 50,
        },
        {
          name: "Mestre do Incentivo",
          description: "Deu seu primeiro Powerup em um amigo.",
          xpReward: 25,
        },
        {
          name: "Constância de Ferro",
          description: "Manteve um streak de 7 dias.",
          xpReward: 500,
        },
      ],
    });
  }
};

export const ensureInitialChallenges = async (tx?: PrismaTransaction) => {
  const client = tx || prisma;

  const globalChallengesCount = await client.challenge.count({
    where: { type: "GLOBAL" },
  });

  if (globalChallengesCount === 0) {
    await client.challenge.create({
      data: {
        name: "Março de Ferro",
        description: "Conclua 20 treinos durante o mês de Março.",
        type: "GLOBAL",
        status: "ACTIVE",
        xpReward: 1000,
        startDate: new Date("2026-03-01T00:00:00Z"),
        endDate: new Date("2026-03-31T23:59:59Z"),
      },
    });
  }
};
