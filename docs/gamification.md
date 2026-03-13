# Gamification & Engagement

The core of PowerFIT's retention strategy lies in its complex gamification system, designed to motivate users through competition and rewards.

## 🎖️ XP System (Experience Points)

Users gain XP by performing various actions in the app.
- **Workout Completed:** Standard reward for finishing a session.
- **Breaking PRs:** Bonus XP for achieving personal records.
- **Streaks:** Bonus for 7-day and 30-day consecutive activity.
- **Social Activity:** Giving/receiving Powerups and comments.

### Leveling Logic
Level calculation is based on an exponential formula located in `src/lib/gamification.ts`. Each level requires significantly more XP than the previous one, following industry-standard RPG mechanics.

## 🔥 Streaks

- **Activity Requirement:** A workout session must be completed at least every 48 hours to maintain a streak.
- **Streak Repair:** Users can "buy back" a broken streak using their accumulated XP, providing a use case for their points.

## 🏆 Achievements & Challenges

### Achievements
Automatic rewards triggered when specific conditions are met:
- "First Workout"
- "Consistency King" (long streaks)
- "Social Butterfly" (friend count)

### Challenges
Users can create or join challenges:
- **Global:** Compete with all users for a period.
- **Friend Duel:** 1v1 competition with a specific friend.
- **Goals:** Challenges can track Total Volume, Workout Count, or XP Gain.

## 📊 Rankings

The system generates dynamic rankings:
- **Global Ranking:** All users.
- **Friend Ranking:** Compete directly with your circle.
Rankings support pagination and are prime candidates for Redis caching.
