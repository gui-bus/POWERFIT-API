import { AppError } from "../../../errors/index.js";
import { prisma } from "../../../lib/db.js";

interface InputDto {
  activityId: string;
}

export class AdminDeleteActivity {
  async execute(dto: InputDto): Promise<void> {
    const activity = await prisma.activity.findUnique({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new AppError("Activity not found", "NOT_FOUND", 404);
    }

    await prisma.activity.delete({
      where: { id: dto.activityId },
    });
  }
}
