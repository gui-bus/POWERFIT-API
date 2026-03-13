# Database Schema & Relationships

PowerFIT uses **PostgreSQL** as its primary data store, with **Prisma ORM** managing schemas, migrations, and type safety.

## 🗄️ Core Entities

### 1. User & Identity
- **User:** The central entity. Stores profile data, XP, level, and social settings.
- **Session/Account/Verification:** Managed by Better-Auth for secure authentication.

### 2. Workout Domain
- **WorkoutPlan:** A collection of workout days (e.g., "Hypertrophy Week").
- **WorkoutDay:** Specific daily routine (e.g., "Monday - Chest").
- **WorkoutExercise:** Definition of an exercise within a plan (sets, reps, rest time).
- **WorkoutSession:** A real-time execution of a WorkoutDay.
- **WorkoutSet:** The actual data recorded for each set during a session (weight, reps).

### 3. Social Ecosystem
- **Friendship:** Many-to-many self-relation on the User table. Handles pending and accepted states.
- **Activity:** Created automatically when a WorkoutSession is completed.
- **Comment:** Users can comment on activities.
- **Powerup:** A "like" equivalent for activities.
- **Notification:** Real-time and persistent alerts for social actions.

### 4. Progress & Gamification
- **PersonalRecord (PR):** Tracks the highest weight/reps for each exercise name.
- **BodyProgressLog:** History of weight, height, and body fat.
- **XpTransaction:** Audit log of every XP gain/loss event.
- **Achievement/UserAchievement:** Definable milestones and their unlock history.
- **Challenge/ChallengeParticipant:** Competitive events with goals and timers.

### 5. Utilities
- **Exercise:** The global library of official exercises.
- **WaterLog:** Daily hydration tracking.
- **Block:** Management of blocked users for privacy.

## 🔗 Key Relationships

- **Cascade Deletes:** Most user-related data (Plans, Logs, PRs) is set to `onDelete: Cascade`, ensuring that deleting an account wipes all associated personal data (GDPR compliant).
- **Indexing:** Indexes are applied to high-frequency query fields like `userId`, `friendCode`, and `loggedAt` to ensure sub-millisecond response times.
