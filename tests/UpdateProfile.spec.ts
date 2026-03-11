import { describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db.js";
import { UpdateProfile } from "../src/useCases/UpdateProfile.js";

vi.mock("../src/lib/db.js", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

describe("UpdateProfile Use Case", () => {
  it("should update user profile data", async () => {
    const userId = "user-1";
    const dto = { userId, name: "Novo Nome", image: "https://photo.com/1" };

    (prisma.user.update as any).mockResolvedValue({
      id: userId,
      name: dto.name,
      image: dto.image,
    });

    const updateProfile = new UpdateProfile();
    const result = await updateProfile.execute(dto);

    expect(result.name).toBe("Novo Nome");
    expect(result.image).toBe("https://photo.com/1");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { name: dto.name, image: dto.image },
    });
  });
});
