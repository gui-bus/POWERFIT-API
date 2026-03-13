import z from "zod";

export const UserTrainDataSchema = z.object({
  weightInGrams: z.number().int().min(1),
  heightInCentimeters: z.number().int().min(1),
  age: z.number().int().min(1),
  bodyFatPercentage: z.number().min(0).max(1),
});

export const GetUserTrainDataResponseSchema = z
  .object({
    userId: z.string(),
    userName: z.string(),
    weightInGrams: z.number(),
    heightInCentimeters: z.number(),
    age: z.number(),
    bodyFatPercentage: z.number(),
  })
  .nullable();

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  image: z.string().url().optional(),
  bio: z.string().max(500).optional().nullable(),
  socialLinks: z.record(z.string(), z.string().url()).optional().nullable(),
});

export const UserMeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  socialLinks: z.record(z.string(), z.string().url()).nullable(),
  friendCode: z.string().nullable(),
  xp: z.number(),
  level: z.number(),
  role: z.string(),
  isPublicProfile: z.boolean(),
  showStats: z.boolean(),
});

export const UpdatePrivacySchema = z.object({
  isPublicProfile: z.boolean().optional(),
  showStats: z.boolean().optional(),
});

export const SearchUsersQuerySchema = z.object({
  query: z.string().trim().min(1),
});

export const SearchUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  friendCode: z.string().nullable(),
  level: z.number(),
  isFriend: z.boolean(),
  isPending: z.boolean(),
});

export const SearchUsersResponseSchema = z.array(SearchUserSchema);

export const PublicProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  socialLinks: z.record(z.string(), z.string().url()).nullable(),
  level: z.number(),
  xp: z.number(),
  streak: z.number(),
  isFriend: z.boolean(),
  isPending: z.boolean(),
  stats: z
    .object({
      weightInGrams: z.number(),
      heightInCentimeters: z.number(),
      age: z.number(),
      bodyFatPercentage: z.number(),
    })
    .nullable(),
  achievements: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      iconUrl: z.string().nullable(),
      unlockedAt: z.string(),
    }),
  ),
});

export const PersonalRecordSchema = z.object({
  id: z.string().uuid(),
  exerciseName: z.string(),
  weightInGrams: z.number(),
  reps: z.number(),
  achievedAt: z.string(),
});

export const UpsertPersonalRecordSchema = z.object({
  exerciseName: z.string().trim().min(1),
  weightInGrams: z.number().int().min(1),
  reps: z.number().int().min(1),
});

export const BodyProgressLogSchema = z.object({
  id: z.string().uuid(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number(),
  loggedAt: z.string(),
});
