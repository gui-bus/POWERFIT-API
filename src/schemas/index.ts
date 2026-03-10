import z from "zod";

import {
  ChallengeStatus,
  ChallengeType,
  FriendshipStatus,
  NotificationType,
  WeekDay,
  XpReason,
} from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      coverImageUrl: z.string().optional().nullable(),
      weekDay: z.enum(WeekDay),
      isRestDay: z.boolean().default(false),
      estimatedDurationInSeconds: z.number().min(1),
      exercises: z.array(
        z.object({
          order: z.number().min(0),
          name: z.string().trim().min(1),
          sets: z.number().min(1),
          reps: z.number().min(1),
          restTimeInSeconds: z.number().min(1),
        }),
      ),
    }),
  ),
});

export const GetWorkoutPlanByIdResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.string().uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRestDay: z.boolean(),
      coverImageUrl: z.string().optional().nullable(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    }),
  ),
});

export const GetWorkoutPlansQuerySchema = z.object({
  active: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export const GetWorkoutPlansResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    isActive: z.boolean(),
    workoutDays: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRestDay: z.boolean(),
        coverImageUrl: z.string().optional().nullable(),
        estimatedDurationInSeconds: z.number(),
        exercises: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
            order: z.number(),
            sets: z.number(),
            reps: z.number(),
            restTimeInSeconds: z.number(),
          }),
        ),
      }),
    ),
  }),
);

export const GetWorkoutDayResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isRestDay: z.boolean(),
  coverImageUrl: z.string().optional().nullable(),
  estimatedDurationInSeconds: z.number(),
  weekDay: z.enum(WeekDay),
  exercises: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      order: z.number(),
      workoutDayId: z.string().uuid(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
    }),
  ),
  sessions: z.array(
    z.object({
      id: z.string().uuid(),
      workoutDayId: z.string().uuid(),
      startedAt: z.string().optional().nullable(),
      completedAt: z.string().optional().nullable(),
    }),
  ),
});

export const WorkoutSessionSchema = z.object({
  id: z.uuid(),
  workoutDayId: z.uuid(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const WorkoutSetSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  workoutExerciseId: z.string().uuid(),
  setIndex: z.number().int().min(0),
  weightInGrams: z.number().int().min(0),
  reps: z.number().int().min(0),
  createdAt: z.string(),
});

export const UpsertWorkoutSetSchema = z.object({
  weightInGrams: z.number().int().min(0),
  reps: z.number().int().min(0),
});

export const WorkoutExerciseHistorySchema = z.object({
  exerciseId: z.string().uuid(),
  lastSets: z.array(WorkoutSetSchema),
});

export const HomeDataSchema = z.object({
  activeWorkoutPlanId: z.uuid().nullable(),
  todayWorkoutDay: z
    .object({
      workoutPlanId: z.uuid(),
      id: z.uuid(),
      name: z.string(),
      isRestDay: z.boolean(),
      weekDay: z.enum(WeekDay),
      estimatedDurationInSeconds: z.number(),
      coverImageUrl: z.string().optional().nullable(),
      exercisesCount: z.number(),
    })
    .nullable(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.string(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
});

export const StatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.string(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
  completedWorkoutsCount: z.number(),
  completedRestDays: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
  totalVolumeInGrams: z.number(),
});

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

export const UserRankingSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  streak: z.number(),
  xp: z.number(),
  level: z.number(),
});

export const GetRankingQuerySchema = z.object({
  sortBy: z.enum(["STREAK", "XP"]).default("STREAK"),
});

export const UserRankingResponseSchema = z.object({
  ranking: z.array(UserRankingSchema),
  currentUserPosition: z.number().nullable(),
});

export const AddFriendSchema = z.object({
  codeOrEmail: z.string().trim().min(1),
});

export const FriendshipRequestSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(FriendshipStatus),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().nullable(),
  }),
});

export const GetFriendRequestsResponseSchema = z.array(FriendshipRequestSchema);

export const FriendSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  friendCode: z.string().nullable(),
  since: z.string(),
});

export const GetFriendsResponseSchema = z.array(FriendSchema);

export const UserMeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  friendCode: z.string().nullable(),
  xp: z.number(),
  level: z.number(),
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
  level: z.number(),
  xp: z.number(),
  streak: z.number(),
  isFriend: z.boolean(),
  isPending: z.boolean(),
  stats: z.object({
    weightInGrams: z.number(),
    heightInCentimeters: z.number(),
    age: z.number(),
    bodyFatPercentage: z.number(),
  }).nullable(),
  achievements: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    iconUrl: z.string().nullable(),
    unlockedAt: z.string(),
  })),
});

export const CommentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  userName: z.string(),
  userImage: z.string().nullable(),
  content: z.string(),
  createdAt: z.string(),
});

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  userName: z.string(),
  userImage: z.string().nullable(),
  workoutDayName: z.string(),
  workoutPlanName: z.string(),
  statusMessage: z.string().nullable(),
  imageUrl: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string(),
  powerupsCount: z.number(),
  hasPowerupByMe: z.boolean(),
  createdAt: z.string(),
  comments: z.array(CommentSchema),
  taggedUsers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  })),
});

export const GetFeedResponseSchema = z.array(ActivitySchema);

export const CreateCommentSchema = z.object({
  content: z.string().trim().min(1).max(500),
});

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(NotificationType),
  isRead: z.boolean(),
  createdAt: z.string(),
  activityId: z.string().uuid().nullable(),
  achievementId: z.string().uuid().nullable(),
  content: z.string().nullable(),
  sender: z
    .object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    })
    .nullable(),
  achievement: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      iconUrl: z.string().nullable(),
    })
    .nullable(),
});

export const GetNotificationsResponseSchema = z.array(NotificationSchema);

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().nullable(),
  xpReward: z.number(),
  unlockedAt: z.string().optional().nullable(),
});

export const GetAchievementsResponseSchema = z.array(AchievementSchema);

export const ChallengeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  type: z.enum(ChallengeType),
  status: z.enum(ChallengeStatus),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  xpReward: z.number(),
  participantsCount: z.number(),
  isJoined: z.boolean(),
});

export const GetChallengesResponseSchema = z.array(ChallengeSchema);

export const XpTransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  reason: z.enum(XpReason),
  createdAt: z.string(),
});

export const GetXpHistoryResponseSchema = z.array(XpTransactionSchema);

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
