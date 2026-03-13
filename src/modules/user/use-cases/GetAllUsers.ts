import { prisma } from "../../../lib/db.js";

interface InputDto {
  page?: number;
  pageSize?: number;
  orderBy?: "createdAt" | "role" | "xp" | "name";
  orderDir?: "asc" | "desc";
}

interface OutputDto {
  users: Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    isBanned: boolean;
    level: number;
    xp: number;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

export class GetAllUsers {
  async execute(dto: InputDto): Promise<OutputDto> {
    const page = dto.page || 1;
    const pageSize = dto.pageSize || 10;
    const orderBy = dto.orderBy || "createdAt";
    const orderDir = dto.orderDir || "desc";

    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: {
          [orderBy]: orderDir,
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isBanned: user.isBanned,
        level: user.level,
        xp: user.xp,
        createdAt: user.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }
}
