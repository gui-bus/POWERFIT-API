import { prisma } from "../lib/db.js";

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
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.update({
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
