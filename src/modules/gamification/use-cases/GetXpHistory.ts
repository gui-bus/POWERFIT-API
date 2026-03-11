import dayjs from "dayjs";

import { XpReason } from "../../../../generated/prisma/enums.js";
import { PrismaClient } from "../../../lib/db.js";

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
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto[]> {
    const transactions = await this.prisma.xpTransaction.findMany({
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
