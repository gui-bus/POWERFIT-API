import { NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  id: string;
  name: string;
  email: string;
  image: string | null;
  friendCode: string | null;
  xp: number;
  level: number;
  isPublicProfile: boolean;
  showStats: boolean;
}

export class GetMe {
  constructor(private readonly prisma: PrismaClient) {}

  private generateRandomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "#";
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.friendCode) {
      let isUnique = false;
      let newCode = "";

      while (!isUnique) {
        newCode = this.generateRandomCode();
        const existing = await this.prisma.user.findUnique({
          where: { friendCode: newCode },
        });
        if (!existing) isUnique = true;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: dto.userId },
        data: { friendCode: newCode },
      });

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        friendCode: updatedUser.friendCode,
        xp: updatedUser.xp,
        level: updatedUser.level,
        isPublicProfile: updatedUser.isPublicProfile,
        showStats: updatedUser.showStats,
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      friendCode: user.friendCode,
      xp: user.xp,
      level: user.level,
      isPublicProfile: user.isPublicProfile,
      showStats: user.showStats,
    };
  }
}
