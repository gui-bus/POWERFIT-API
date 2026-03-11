import { describe, expect, it } from "vitest";

import {
  AddFriendSchema,
  PaginationQuerySchema,
  UpdateProfileSchema,
} from "../src/schemas/index.js";

describe("Zod Schemas Validation", () => {
  describe("PaginationQuerySchema", () => {
    it("should validate correct pagination params", () => {
      const result = PaginationQuerySchema.safeParse({
        limit: "10",
        cursor: "d62ed5b7-2266-497c-9a99-94d78a57798d",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
      }
    });

    it("should fail if limit is too high", () => {
      const result = PaginationQuerySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  describe("AddFriendSchema", () => {
    it("should trim and require non-empty string", () => {
      const result = AddFriendSchema.safeParse({ codeOrEmail: "   " });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateProfileSchema", () => {
    it("should require a valid URL for image", () => {
      const result = UpdateProfileSchema.safeParse({ image: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("should pass with a valid URL", () => {
      const result = UpdateProfileSchema.safeParse({
        image: "https://example.com/photo.jpg",
      });
      expect(result.success).toBe(true);
    });
  });
});
