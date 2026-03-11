import dayjs from "dayjs";

import { XpReason } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  id: string;
  amount: number;
  reason: XpReason;
  createdAt: string;
}

export class GetXpHistory {
  async execute(dto: InputDto): Promise<OutputDto[]> {
    const transactions = await prisma.xpTransaction.findMany({
      where: { userId: dto.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      reason: t.reason,
      createdAt: dayjs(t.createdAt).toISOString(),
    }));
  }
}
