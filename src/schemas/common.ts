import z from "zod";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const PaginationQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
