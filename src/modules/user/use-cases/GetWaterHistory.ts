import dayjs from "dayjs";

import { prisma } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  totalInMl: number;
  logs: Array<{
    id: string;
    amountInMl: number;
    loggedAt: Date;
  }>;
}

export class GetWaterHistory {
  async execute(dto: InputDto): Promise<OutputDto> {
    const startOfDay = dayjs(dto.date).startOf("day").toDate();
    const endOfDay = dayjs(dto.date).endOf("day").toDate();

    const logs = await prisma.waterLog.findMany({
      where: {
        userId: dto.userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { loggedAt: "desc" },
    });

    const totalInMl = logs.reduce((acc, log) => acc + log.amountInMl, 0);

    return {
      totalInMl,
      logs: logs.map((log) => ({
        id: log.id,
        amountInMl: log.amountInMl,
        loggedAt: log.loggedAt,
      })),
    };
  }
}
