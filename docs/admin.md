# Admin Dashboard & Governance

The PowerFIT Admin ecosystem provides the necessary tools to curate content and maintain a healthy community.

## 🖥️ Management Features

### 1. User Governance
- **Global User List:** Paged and sortable view of all users in the system.
- **Role Management:** Capability to promote users to `ADMIN` or demote to `USER`.
- **Ban System:** Instant suspension of accounts for policy violations.

### 2. Content Curation
- **Global Exercise Library:** Admins can create, edit, and delete the official exercises available to all users.
- **Workout Templates:** Management of "Recommended Plans" that serve as onboarding for new users.

### 3. Community Moderation
- **Activity Removal:** Admins can delete any post from the social feed if it contains inappropriate content.
- **Comment Moderation:** Full control over all comment sections.

## 📈 System Metrics

The `GET /admin/stats` endpoint provides a high-level overview of system health:
- **Total Users:** Growth tracking.
- **Active Sessions:** Engagement tracking.
- **Exercise Popularity:** Insights into user preferences.
- **Moderation Volume:** Tracking banned accounts and removed content.

## 🔐 Implementation Detail

All admin features are strictly protected by the `authorize(['ADMIN'])` middleware. Any attempt to access these routes with a standard `USER` role results in a `403 Forbidden` response.
