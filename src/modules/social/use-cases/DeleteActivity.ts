import { ForbiddenError, NotFoundError } from "../../../errors/index.js";
import { PrismaClient } from "../../../lib/db.js";

interface InputDto {
  userId: string;
  activityId: string;
}

export class DeleteActivity {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: InputDto): Promise<void> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== dto.userId) {
      throw new ForbiddenError("You can only delete your own activities");
    }

    await this.prisma.activity.delete({
      where: { id: dto.activityId },
    });
  }
}
