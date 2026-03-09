import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  activityId: string;
}

export class DeleteActivity {
  async execute(dto: InputDto): Promise<void> {
    const activity = await prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== dto.userId) {
      throw new ForbiddenError("You can only delete your own activities");
    }

    await prisma.activity.delete({
      where: { id: dto.activityId },
    });
  }
}
