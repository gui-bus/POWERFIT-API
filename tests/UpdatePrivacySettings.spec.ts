import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { UpdatePrivacySettings } from "../src/modules/user/use-cases/UpdatePrivacySettings.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

describe("UpdatePrivacySettings Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update privacy settings for the user", async () => {
    const userId = "user-1";
    const dto = {
      userId,
      isPublicProfile: false,
      showStats: false,
    };

    const updatePrivacy = new UpdatePrivacySettings(prisma as any);
    await updatePrivacy.execute(dto);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        isPublicProfile: false,
        showStats: false,
      },
    });
  });
});
