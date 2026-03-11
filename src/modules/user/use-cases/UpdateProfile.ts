import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  name?: string;
  image?: string;
}

interface OutputDto {
  id: string;
  name: string;
  image: string | null;
}

export class UpdateProfile {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        name: dto.name,
        image: dto.image,
      },
    });

    return {
      id: user.id,
      name: user.name,
      image: user.image,
    };
  }
}
