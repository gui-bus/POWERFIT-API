import { describe, expect, it, vi, beforeEach } from "vitest";
import { UpdatePrivacySettings } from "../src/useCases/UpdatePrivacySettings.js";
import { prisma } from "../src/lib/db.js";

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

    const updatePrivacy = new UpdatePrivacySettings();
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
