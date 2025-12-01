# GrowlinkApp API & Database Design

## Overview

This document outlines the GraphQL API schema and DynamoDB table design for the GrowlinkApp exclusive mentorship platform. GrowlinkApp combines traditional mentorship with a **1% Habit-Based Growth System** inspired by Atomic Habits.

---

## Core Data Model

### 1. User (Profile)

**Purpose**: Central user profiles supporting mentors, mentees, and dual-role users

**DynamoDB Table**: `Users`

- **PK**: `userId` (String) - Cognito sub (UUID, immutable)
- **SK**: (None - single item per user)

- **Attributes**:
  - `email` (String) - User email (synced from Cognito)
  - `username` (String) - Unique username
  - `name` (String) - Display name
  - `title` (String) - Professional title
  - `role` (String) - `MENTOR`, `MENTEE`, `BOTH`
  - `bio` (String) - User bio/description
  - `avatar` (String) - S3 URL for profile photo
  - `location` (String) - City, State/Country
  - `skills` (Set of Strings) - User skills/expertise
  - `interests` (Set of Strings) - User interests
  - `membershipTier` (String) - `standard`, `premium`, `exclusive`
  - `verified` (Boolean) - Admin-verified status
  - `rating` (Number) - Average rating (0.0-5.0, auto-calculated)
  - `totalSessions` (Number) - Total sessions completed
  - `inPersonSessions` (Number) - In-person sessions completed
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type User {
  userId: ID! # Cognito sub (immutable)
  email: String!
  username: String!
  name: String!
  title: String
  role: UserRole!
  bio: String
  avatar: String
  location: String
  skills: [String!]!
  interests: [String!]!
  membershipTier: MembershipTier!
  verified: Boolean!
  rating: Float!
  totalSessions: Int!
  inPersonSessions: Int!
  mentorshipCategories: [Category!]!
  createdAt: String!
  updatedAt: String!
}

enum UserRole {
  MENTOR
  MENTEE
  BOTH
}

enum MembershipTier {
  standard
  premium
  exclusive
}
```

**Access Patterns**:
- Get user by ID: Query by `PK = userId`
- Get user by email (login/lookup): Query GSI by `email`
- Get user by username: Query GSI by `username`
- List users by role: Query GSI by `role`
- Search users by interest: Query GSI by `interests` (contains filter)
- Update user profile
- Calculate rating: Aggregate from Reviews table

---

### 2. Category (Mentorship Categories)

**Purpose**: Mentorship categories (Career, Fitness, Wellness, Relationships, etc.)

**DynamoDB Table**: `Categories`

- **PK**: `categoryId` (String) - UUID
- **SK**: (None - single item per category)

- **Attributes**:
  - `name` (String) - Category name
  - `description` (String) - Category description
  - `icon` (String) - Icon identifier
  - `color` (String) - Hex color code
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Category {
  categoryId: ID!
  name: String!
  description: String
  icon: String
  color: String
  createdAt: String!
  updatedAt: String!
}
```

**Access Patterns**:
- Get category by ID: Query by `PK = categoryId`
- List all categories: Scan table (small dataset)
- Get category by name: Query GSI by `name`

---

### 3. UserCategory (Many-to-Many Relationship)

**Purpose**: Links users to mentorship categories

**DynamoDB Table**: `UserCategories`

- **PK**: `userId` (String)
- **SK**: `categoryId` (String)

- **Attributes**:
  - `createdAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type UserCategory {
  user: User!
  category: Category!
  createdAt: String!
}
```

**Access Patterns**:
- Get all categories for a user: Query by `PK = userId`
- Get all users for a category: Query GSI by `categoryId`

---

### 4. Session (Root Entity)

**Purpose**: Core mentorship session entity supporting both virtual and in-person meetings

**DynamoDB Table**: `Sessions`

- **PK**: `sessionId` (String) - UUID
- **SK**: (None - single item per session)

- **Attributes**:
  - `mentorId` (String) - User ID of mentor
  - `menteeId` (String) - User ID of mentee
  - `type` (String) - `virtual`, `in_person`
  - `venueId` (String) - Venue ID (required for in-person)
  - `date` (String) - ISO datetime of session
  - `time` (String) - Time string (e.g., "14:00")
  - `duration` (Number) - Duration in minutes
  - `status` (String) - `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
  - `price` (Number) - Session price (calculated)
  - `topic` (String) - Session topic/discussion focus
  - `rating` (Number) - Session rating (1-5)
  - `review` (String) - Session review text
  - `feedbackEligible` (Boolean) - Can submit feedback (24h after completion)
  - `feedbackSubmitted` (Boolean) - Feedback already submitted
  - `feedbackSubmittedAt` (String) - ISO timestamp
  - `notes` (String) - Session notes
  - `meetingLink` (String) - Zoom/Meet link (required for virtual)
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Session {
  sessionId: ID!
  mentor: User!
  mentee: User!
  type: SessionType!
  venue: Venue
  date: String!
  time: String!
  duration: Int!
  status: SessionStatus!
  price: Float!
  topic: String
  rating: Float
  review: String
  feedbackEligible: Boolean!
  feedbackSubmitted: Boolean!
  feedbackSubmittedAt: String
  notes: String
  meetingLink: String
  feedback: SessionFeedback
  mentorNotes: MentorSessionNotes
  createdAt: String!
  updatedAt: String!
}

enum SessionType {
  virtual
  in_person
}

enum SessionStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

**Access Patterns**:
- Get session by ID: Query by `PK = sessionId`
- List sessions for mentor: Query GSI by `mentorId`, sort by `date`
- List sessions for mentee: Query GSI by `menteeId`, sort by `date`
- List sessions by status: Query GSI by `status`
- List upcoming sessions: Query GSI by `date` with filter
- List sessions by venue: Query GSI by `venueId`

**Business Rules**:
- In-person sessions require `venueId`
- Virtual sessions require `meetingLink`
- `feedbackEligible` becomes `true` 24 hours after completion
- Price calculation: `basePrice * (type === 'in_person' ? 0.7 : 1.0)` (30% discount)
- Rating bonus: In-person sessions get +0.2 rating boost

---

### 5. Venue (Partner Locations)

**Purpose**: Partner venues for in-person sessions (libraries, co-working spaces, cafes)

**DynamoDB Table**: `Venues`

- **PK**: `venueId` (String) - UUID
- **SK**: (None - single item per venue)

- **Attributes**:
  - `name` (String) - Venue name
  - `type` (String) - `library`, `co_working`, `cafe`, `community_center`
  - `address` (String) - Street address
  - `city` (String) - City name
  - `state` (String) - State/province
  - `zipCode` (String) - Postal code
  - `country` (String) - Country (default: "USA")
  - `capacity` (Number) - Maximum capacity
  - `amenities` (List of Strings) - Available amenities
  - `image` (String) - S3 URL for venue photo
  - `isPartner` (Boolean) - Partner venue status
  - `partnershipTier` (String) - `bronze`, `silver`, `gold`
  - `discountPercentage` (Number) - Discount (0-30)
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Venue {
  venueId: ID!
  name: String!
  type: VenueType!
  address: String!
  city: String!
  state: String
  zipCode: String
  country: String!
  capacity: Int!
  amenities: [String!]!
  image: String
  isPartner: Boolean!
  partnershipTier: PartnershipTier
  discountPercentage: Int!
  createdAt: String!
  updatedAt: String!
}

enum VenueType {
  library
  co_working
  cafe
  community_center
}

enum PartnershipTier {
  bronze
  silver
  gold
}
```

**Access Patterns**:
- Get venue by ID: Query by `PK = venueId`
- List venues by city: Query GSI by `city`
- List partner venues: Query GSI by `isPartner`
- List venues by type: Query GSI by `type`

**Business Rules**:
- Partner venues provide discounts: Gold (30%), Silver (20%), Bronze (10%)
- `discountPercentage` ranges from 0-30%

---

### 6. Goal (Identity-Based Goals)

**Purpose**: Identity-based goals ("I want to become a [type of person] who [action]")

**DynamoDB Table**: `Goals`

- **PK**: `goalId` (String) - UUID
- **SK**: (None - single item per goal)

- **Attributes**:
  - `userId` (String) - User ID (mentee)
  - `identity` (String) - "I want to become a..."
  - `title` (String) - Goal title
  - `description` (String) - Goal description
  - `category` (String) - Goal category
  - `progress` (Number) - Progress percentage (0-100, auto-calculated)
  - `dueDate` (String) - ISO date
  - `status` (String) - `draft`, `pending_approval`, `active`, `completed`, `archived`
  - `mentorId` (String) - Assigned mentor ID
  - `mentorApproved` (Boolean) - Mentor approval status
  - `mentorApprovedAt` (String) - ISO timestamp
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Goal {
  goalId: ID!
  user: User!
  identity: String
  title: String!
  description: String
  category: String
  progress: Int!
  dueDate: String
  status: GoalStatus!
  mentor: User
  mentorApproved: Boolean!
  mentorApprovedAt: String
  habits: [Habit!]!
  todos: [Todo!]!
  reflections: [Reflection!]!
  createdAt: String!
  updatedAt: String!
}

enum GoalStatus {
  draft
  pending_approval
  active
  completed
  archived
}
```

**Access Patterns**:
- Get goal by ID: Query by `PK = goalId`
- List goals for user: Query GSI by `userId`, sort by `createdAt`
- List goals by status: Query GSI by `status`
- List goals by mentor: Query GSI by `mentorId`

**Business Rules**:
- Goals start as `draft` status
- Moving to `active` requires mentor approval if `mentorId` is set
- `progress` is calculated from habit completion rates
- Goals can be archived but not deleted (for historical tracking)

---

### 7. Habit (Micro-Habits)

**Purpose**: Micro-habits (≤2 minutes) linked to goals with cue-based design

**DynamoDB Table**: `Habits`

- **PK**: `habitId` (String) - UUID
- **SK**: (None - single item per habit)

- **Attributes**:
  - `goalId` (String) - Parent goal ID
  - `userId` (String) - User ID
  - `title` (String) - Habit title
  - `description` (String) - Habit description
  - `frequency` (String) - `daily`, `weekly`
  - `duration` (Number) - Duration in minutes (should be ≤ 2)
  - `cue` (Map) - Cue structure
    - `time` (String) - "08:00", "after breakfast"
    - `place` (String) - "at my desk", "in the kitchen"
    - `context` (String) - "when I feel stressed"
  - `reward` (String) - Reward description
  - `status` (String) - `active`, `paused`, `completed`
  - `currentStreak` (Number) - Current streak count (auto-calculated)
  - `longestStreak` (Number) - Longest streak (auto-calculated)
  - `completionRate` (Number) - Completion rate 0-100 (auto-calculated)
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Habit {
  habitId: ID!
  goal: Goal!
  user: User!
  title: String!
  description: String
  frequency: HabitFrequency!
  duration: Int!
  cue: HabitCue!
  reward: String
  status: HabitStatus!
  currentStreak: Int!
  longestStreak: Int!
  completionRate: Float!
  completions: [HabitCompletion!]!
  createdAt: String!
  updatedAt: String!
}

type HabitCue {
  time: String
  place: String
  context: String
}

enum HabitFrequency {
  daily
  weekly
}

enum HabitStatus {
  active
  paused
  completed
}
```

**Access Patterns**:
- Get habit by ID: Query by `PK = habitId`
- List habits for user: Query GSI by `userId`
- List habits for goal: Query GSI by `goalId`
- List active habits: Query GSI by `status` with filter

**Business Rules**:
- `duration` should be ≤ 2 minutes (enforced in API validation)
- `completionRate` = (completed days / total days since creation) * 100
- Streaks reset after missing 1 day for daily habits, 1 week for weekly habits
- `currentStreak` and `longestStreak` are auto-calculated from completions

---

### 8. HabitCompletion (Daily/Weekly Tracking)

**Purpose**: Daily/weekly habit completion tracking

**DynamoDB Table**: `HabitCompletions`

- **PK**: `habitId` (String)
- **SK**: `date` (String) - ISO date (YYYY-MM-DD)

- **Attributes**:
  - `userId` (String) - User ID
  - `completed` (Boolean) - Completion status
  - `notes` (String) - Completion notes
  - `evidence` (String) - URL to image/proof
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type HabitCompletion {
  habitId: ID!
  habit: Habit!
  user: User!
  date: String!
  completed: Boolean!
  notes: String
  evidence: String
  createdAt: String!
  updatedAt: String!
}
```

**Access Patterns**:
- Get completion by habit and date: Query by `PK = habitId`, `SK = date`
- List completions for habit: Query by `PK = habitId`, sort by `SK` (date)
- List completions for user: Query GSI by `userId`, sort by `date`
- Get completion streak: Query by `PK = habitId`, scan backwards from today

**Business Rules**:
- One completion record per habit per day/week (enforced by PK/SK)
- Can be marked completed retroactively within 7 days
- `evidence` field supports image URLs for proof

---

### 9. Reflection (Daily Mood & Weekly Journaling)

**Purpose**: Daily mood tracking and weekly journaling entries

**DynamoDB Table**: `Reflections`

- **PK**: `userId` (String)
- **SK**: `date` (String) - ISO date (YYYY-MM-DD)

- **Attributes**:
  - `reflectionId` (String) - UUID (for GraphQL ID field)
  - `goalId` (String) - Associated goal ID
  - `mood` (String) - `GREAT`, `GOOD`, `NEUTRAL`, `BAD`, `AWFUL`
  - `moodScore` (Number) - Numeric score (1-10)
  - `text` (String) - Simple daily reflection text
  - `content` (Map) - Structured weekly reflection
    - `whatWentWell` (String)
    - `whatFeltHard` (String)
    - `insights` (String)
    - `gratitude` (List of Strings)
  - `isShared` (Boolean) - Visible to mentor(s)
  - `sharedWithMentorId` (String) - Specific mentor to share with (one-to-one relationship; if multiple mentors needed, use separate sharing mechanism)
  - `mentorFeedback` (Map) - Mentor feedback
    - `mentorId` (String)
    - `feedback` (String)
    - `createdAt` (String)
  - `aiInsights` (String) - AI-generated insights
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Reflection {
  reflectionId: ID!
  user: User!
  goal: Goal
  date: String!
  mood: Mood!
  moodScore: Int
  text: String
  content: ReflectionContent
  isShared: Boolean!
  sharedWithMentor: User
  mentorFeedback: MentorFeedback
  aiInsights: String
  createdAt: String!
  updatedAt: String!
}

type ReflectionContent {
  whatWentWell: String
  whatFeltHard: String
  insights: String
  gratitude: [String!]!
}

type MentorFeedback {
  mentorId: ID!
  feedback: String!
  createdAt: String!
}

enum Mood {
  GREAT
  GOOD
  NEUTRAL
  BAD
  AWFUL
}
```

**Access Patterns**:
- Get reflection by user and date: Query by `PK = userId`, `SK = date`
- List reflections for user: Query by `PK = userId`, sort by `SK` (date DESC)
- List shared reflections: Query GSI by `isShared` and `sharedWithMentorId`
- List reflections for goal: Query GSI by `goalId`

**Business Rules**:
- One reflection per user per day (enforced by PK/SK)
- Weekly reflections (Sunday) require structured `content` field
- Daily reflections can use simple `text` field
- `isShared` makes reflection visible to mentor
- `aiInsights` generated via background job after reflection submission

---

### 10. SessionFeedback (Detailed Session Feedback)

**Purpose**: Detailed session feedback form with growth areas and improvement suggestions

**DynamoDB Table**: `SessionFeedbacks`

- **PK**: `sessionId` (String)
- **SK**: (None - one feedback per session)

- **Attributes**:
  - `feedbackId` (String) - UUID (for GraphQL ID field)
  - `menteeId` (String) - Mentee user ID
  - `mentorId` (String) - Mentor user ID
  - `rating` (Number) - Rating (1-5)
  - `growthArea` (String) - Primary growth area discussed
  - `growthIdea` (String) - Actionable growth idea
  - `whatWentWell` (String) - Positive feedback
  - `whatToImprove` (String) - Improvement suggestions
  - `additionalComments` (String) - Additional comments
  - `isAnonymous` (Boolean) - Hide mentee identity
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type SessionFeedback {
  feedbackId: ID!
  session: Session!
  mentee: User!
  mentor: User!
  rating: Int!
  growthArea: String!
  growthIdea: String!
  whatWentWell: String!
  whatToImprove: String!
  additionalComments: String
  isAnonymous: Boolean!
  createdAt: String!
  updatedAt: String!
}
```

**Access Patterns**:
- Get feedback by session: Query by `PK = sessionId`
- List feedbacks for mentor: Query GSI by `mentorId`
- List feedbacks for mentee: Query GSI by `menteeId`

**Business Rules**:
- One feedback per session (enforced by PK)
- Can only be submitted 24 hours after session completion
- Expires 7 days after session completion
- `isAnonymous` hides mentee identity from mentor

---

### 11. Review (General Reviews)

**Purpose**: General reviews for mentors/mentees (not session-specific)

**DynamoDB Table**: `Reviews`

- **PK**: `targetId` (String) - User ID being reviewed
- **SK**: `authorId` (String) - User ID of reviewer

- **Attributes**:
  - `authorId` (String) - User ID of reviewer (also SK)
  - `targetId` (String) - User ID being reviewed (also PK)
  - `rating` (Number) - Rating (1-5)
  - `comment` (String) - Review comment
  - `type` (String) - `SESSION_FEEDBACK`, `GENERAL`
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**Note**: This structure enforces one review per author-target pair. The `reviewId` in GraphQL can be computed as `${targetId}#${authorId}` or stored as a separate attribute for convenience.

**GraphQL Type**:

```graphql
type Review {
  reviewId: ID!
  author: User!
  target: User!
  rating: Int!
  comment: String
  type: ReviewType!
  createdAt: String!
  updatedAt: String!
}

enum ReviewType {
  SESSION_FEEDBACK
  GENERAL
}
```

**Access Patterns**:
- Get review by target and author: Query by `PK = targetId`, `SK = authorId`
- List reviews for target: Query by `PK = targetId`, sort by `SK` (authorId)
- List reviews by author: Query GSI by `authorId`, sort by `createdAt`

---

### 12. Event (Community Events)

**Purpose**: Community events (hangouts, workshops, networking meetups)

**DynamoDB Table**: `Events`

- **PK**: `eventId` (String) - UUID
- **SK**: (None - single item per event)

- **Attributes**:
  - `title` (String) - Event title
  - `description` (String) - Event description
  - `type` (String) - `hangout`, `workshop`, `networking`, `casual_meetup`
  - `venueId` (String) - Venue ID (optional)
  - `hostId` (String) - Host user ID
  - `date` (String) - ISO datetime
  - `time` (String) - Time string
  - `duration` (Number) - Duration in minutes
  - `maxAttendees` (Number) - Maximum attendees
  - `isVirtual` (Boolean) - Virtual event flag
  - `price` (Number) - Event price (default: 0)
  - `tags` (List of Strings) - Event tags
  - `image` (String) - S3 URL for event image
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Event {
  eventId: ID!
  title: String!
  description: String!
  type: EventType!
  venue: Venue
  host: User!
  date: String!
  time: String!
  duration: Int!
  maxAttendees: Int!
  currentAttendees: Int!
  isVirtual: Boolean!
  price: Float!
  tags: [String!]!
  image: String
  attendances: [EventAttendance!]!
  createdAt: String!
  updatedAt: String!
}

enum EventType {
  hangout
  workshop
  networking
  casual_meetup
}
```

**Access Patterns**:
- Get event by ID: Query by `PK = eventId`
- List events by date: Query GSI by `date`, sort by date
- List events by host: Query GSI by `hostId`
- List events by type: Query GSI by `type`
- List events by venue: Query GSI by `venueId`

**Business Rules**:
- `maxAttendees` enforced at booking time
- Events can be cancelled up to 24 hours before start time
- Virtual events require `meetingLink` (added via mutation)

---

### 13. EventAttendance (Event Registrations)

**Purpose**: Tracks event registrations and attendance

**DynamoDB Table**: `EventAttendances`

- **PK**: `eventId` (String)
- **SK**: `userId` (String)

- **Attributes**:
  - `attendanceId` (String) - UUID (for GraphQL ID field)
  - `status` (String) - `registered`, `attended`, `cancelled`, `no_show`
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type EventAttendance {
  attendanceId: ID!
  event: Event!
  user: User!
  status: AttendanceStatus!
  createdAt: String!
  updatedAt: String!
}

enum AttendanceStatus {
  registered
  attended
  cancelled
  no_show
}
```

**Access Patterns**:
- Get attendance by event and user: Query by `PK = eventId`, `SK = userId`
- List attendances for event: Query by `PK = eventId`
- List attendances for user: Query GSI by `userId`

---

### 14. Badge (Gamification)

**Purpose**: Achievement badges for users

**DynamoDB Table**: `Badges`

- **PK**: `userId` (String)
- **SK**: `earnedAt` (String) - ISO timestamp

- **Attributes**:
  - `badgeId` (String) - UUID (for GraphQL ID field)
  - `type` (String) - Badge type
  - `title` (String) - Badge title
  - `description` (String) - Badge description
  - `icon` (String) - Icon identifier
  - `metadata` (Map) - Additional badge-specific data
  - `createdAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Badge {
  badgeId: ID!
  user: User!
  type: BadgeType!
  title: String!
  description: String!
  icon: String!
  metadata: AWSJSON
  earnedAt: String!
  createdAt: String!
}

enum BadgeType {
  consistency
  reflection
  identity_builder
  streak
  milestone
  session_completion
  mentor_verified
}
```

**Access Patterns**:
- List badges for user: Query by `PK = userId`, sort by `SK` (earnedAt DESC)
- List badges by type: Query GSI by `type`

**Business Rules**:
- Badges are auto-awarded via background jobs
- Consistency badge: 30 days of habit completion ≥80%
- Streak badge: 7/14/30/100 day streaks
- Identity builder: Complete first identity-based goal

---

### 15. Notification (User Notifications)

**Purpose**: User notifications and alerts

**DynamoDB Table**: `Notifications`

- **PK**: `userId` (String)
- **SK**: `createdAt` (String) - ISO timestamp

- **Attributes**:
  - `notificationId` (String) - UUID (for GraphQL ID field)
  - `title` (String) - Notification title
  - `message` (String) - Notification message
  - `type` (String) - Notification type
  - `read` (Boolean) - Read status
  - `relatedId` (String) - ID of related entity (session, event, etc.)
  - `actionUrl` (String) - Deep link to related page
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Notification {
  notificationId: ID!
  user: User!
  title: String!
  message: String!
  type: NotificationType!
  read: Boolean!
  relatedId: ID
  actionUrl: String
  createdAt: String!
  updatedAt: String!
}

enum NotificationType {
  session_booked
  session_upcoming
  session_reminder
  feedback_received
  badge_earned
  goal_approved
  reflection_reminder
  habit_reminder
  event_registered
  admin_update
}
```

**Access Patterns**:
- List notifications for user: Query by `PK = userId`, sort by `SK` (createdAt DESC)
- List unread notifications: Query by `PK = userId` with filter `read = false`
- List notifications by type: Query GSI by `type`

**Business Rules**:
- Notifications are auto-created via triggers/background jobs
- Session reminders sent 24 hours and 1 hour before session
- Reflection reminders sent every Sunday
- Habit reminders sent daily at user's preferred time

---

### 16. Todo (Simple Todos)

**Purpose**: Simple todo items linked to goals or standalone

**DynamoDB Table**: `Todos`

- **PK**: `userId` (String)
- **SK**: `todoId` (String) - UUID

- **Attributes**:
  - `goalId` (String) - Associated goal ID (optional)
  - `text` (String) - Todo text
  - `done` (Boolean) - Completion status
  - `dueDate` (String) - ISO date
  - `priority` (String) - `low`, `medium`, `high`
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type Todo {
  todoId: ID!
  user: User!
  goal: Goal
  text: String!
  done: Boolean!
  dueDate: String
  priority: TodoPriority!
  createdAt: String!
  updatedAt: String!
}

enum TodoPriority {
  low
  medium
  high
}
```

**Access Patterns**:
- List todos for user: Query by `PK = userId`
- List todos for goal: Query GSI by `goalId`
- List incomplete todos: Query by `PK = userId` with filter `done = false`

---

### 17. MentorSessionNotes (Private Mentor Notes)

**Purpose**: Private notes mentors can keep about sessions

**DynamoDB Table**: `MentorSessionNotes`

- **PK**: `sessionId` (String)
- **SK**: (None - one note per session)

- **Attributes**:
  - `noteId` (String) - UUID (for GraphQL ID field)
  - `mentorId` (String) - Mentor user ID
  - `summary` (String) - Session summary
  - `followUps` (String) - Follow-up actions
  - `growthFocus` (String) - Growth focus areas
  - `privateNotes` (String) - Private notes (not visible to mentee)
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp

**GraphQL Type**:

```graphql
type MentorSessionNotes {
  noteId: ID!
  session: Session!
  mentor: User!
  summary: String!
  followUps: String
  growthFocus: String
  privateNotes: String
  createdAt: String!
  updatedAt: String!
}
```

**Access Patterns**:
- Get notes by session: Query by `PK = sessionId`
- List notes for mentor: Query GSI by `mentorId`

**Authorization**: Mentor-only access

---

## Design Assumptions & Limitations

**User-Centric Data Model**: This design assumes users are the primary organizational unit, with most tables using `userId` as the partition key (PK) or including it in composite keys. This reflects the core user flow: users create goals, track habits, book sessions, and manage their growth journey. All activities (habits, reflections, sessions) happen within a user's context. The mentor-centric access pattern ("My Mentees") is supported via GSIs on Sessions, Reflections, and Goals tables, enabling mentors to query all mentees they're working with. This user-centric approach is optimal for the MVP's personal growth workflow, where the user dashboard serves as the primary interface and most queries follow the pattern "show me everything for this specific user."

**Acknowledged Limitations**: This user-centric approach may become limiting as the application scales to include cross-user features such as mentor analytics dashboards aggregating data across all mentees, mentor comparison tools, community leaderboards, cross-user habit challenges, or social features (following other users, sharing progress publicly). These features would require either expensive scatter-gather queries across multiple user partitions or the addition of new mentor-centric tables with `mentorId` as PK. For MVP, this design prioritizes speed to market and the core personal growth workflow. Future extensions can add mentor-level tables (MentorAnalytics, MentorMenteeRelationships) and supplementary GSIs on existing tables (e.g., GSI on Sessions with PK=mentorId for "all sessions I've mentored") to support cross-user queries without requiring a fundamental redesign of the user-centric core.

**Session-Centric Considerations**: While sessions involve two users (mentor and mentee), the design uses `sessionId` as PK for Sessions table to enable efficient session lookups. GSIs on `mentorId` and `menteeId` support both user perspectives. This hybrid approach balances session management needs with user-centric queries.

---

## API Queries & Mutations

### Queries

**User Queries:**

```graphql
query GetUser($userId: ID!) {
  getUser(userId: $userId): User
}

query GetUserByEmail($email: String!) {
  getUserByEmail(email: $email): User
}

query GetUserByUsername($username: String!) {
  getUserByUsername(username: $username): User
}

query ListUsersByRole($role: UserRole!) {
  listUsersByRole(role: $role): [User!]!
}
```

**Session Queries:**

```graphql
query GetSession($sessionId: ID!) {
  getSession(sessionId: $sessionId): Session
}

query ListSessionsForMentor($mentorId: ID!, $status: SessionStatus) {
  listSessionsForMentor(mentorId: $mentorId, status: $status): [Session!]!
}

query ListSessionsForMentee($menteeId: ID!, $status: SessionStatus) {
  listSessionsForMentee(menteeId: $menteeId, status: $status): [Session!]!
}

query ListUpcomingSessions($userId: ID!) {
  listUpcomingSessions(userId: $userId): [Session!]!
}
```

**Goal & Habit Queries:**

```graphql
query GetGoal($goalId: ID!) {
  getGoal(goalId: $goalId): Goal
}

query ListGoalsForUser($userId: ID!, $status: GoalStatus) {
  listGoalsForUser(userId: $userId, status: $status): [Goal!]!
}

query GetHabit($habitId: ID!) {
  getHabit(habitId: $habitId): Habit
}

query ListHabitsForUser($userId: ID!) {
  listHabitsForUser(userId: $userId): [Habit!]!
}

query ListHabitsForGoal($goalId: ID!) {
  listHabitsForGoal(goalId: $goalId): [Habit!]!
}

query GetHabitStats($habitId: ID!) {
  getHabitStats(habitId: $habitId): HabitStats!
}
```

**Reflection Queries:**

```graphql
query GetReflection($userId: ID!, $date: String!) {
  getReflection(userId: $userId, date: $date): Reflection
}

query ListReflectionsForUser($userId: ID!, $limit: Int) {
  listReflectionsForUser(userId: $userId, limit: $limit): [Reflection!]!
}

query ListSharedReflections($mentorId: ID!) {
  listSharedReflections(mentorId: $mentorId): [Reflection!]!
}
```

**Event Queries:**

```graphql
query GetEvent($eventId: ID!) {
  getEvent(eventId: $eventId): Event
}

query ListEvents($dateFrom: String, $dateTo: String, $type: EventType) {
  listEvents(dateFrom: $dateFrom, dateTo: $dateTo, type: $type): [Event!]!
}

query ListEventsForHost($hostId: ID!) {
  listEventsForHost(hostId: $hostId): [Event!]!
}
```

**Venue Queries:**

```graphql
query GetVenue($venueId: ID!) {
  getVenue(venueId: $venueId): Venue
}

query ListVenues($city: String, $type: VenueType, $isPartner: Boolean) {
  listVenues(city: $city, type: $type, isPartner: $isPartner): [Venue!]!
}
```

**Notification Queries:**

```graphql
query ListNotifications($userId: ID!, $read: Boolean, $limit: Int) {
  listNotifications(userId: $userId, read: $read, limit: $limit): [Notification!]!
}

query GetUnreadNotificationCount($userId: ID!) {
  getUnreadNotificationCount(userId: $userId): Int!
}
```

### Mutations

**User Mutations:**

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input): User!
}

mutation UpdateUserProfile($userId: ID!, $input: UpdateUserInput!) {
  updateUserProfile(userId: $userId, input: $input): User!
}
```

**Session Mutations:**

```graphql
mutation CreateSession($input: CreateSessionInput!) {
  createSession(input: $input): Session!
}

mutation ConfirmSession($sessionId: ID!) {
  confirmSession(sessionId: $sessionId): Session!
}

mutation CompleteSession($sessionId: ID!, $notes: String) {
  completeSession(sessionId: $sessionId, notes: $notes): Session!
}

mutation CancelSession($sessionId: ID!, $reason: String) {
  cancelSession(sessionId: $sessionId, reason: $reason): Session!
}
```

**Goal & Habit Mutations:**

```graphql
mutation CreateGoal($input: CreateGoalInput!) {
  createGoal(input: $input): Goal!
}

mutation ApproveGoal($goalId: ID!) {
  approveGoal(goalId: $goalId): Goal!
}

mutation CreateHabit($input: CreateHabitInput!) {
  createHabit(input: $input): Habit!
}

mutation CompleteHabit($habitId: ID!, $date: String!, $notes: String, $evidence: String) {
  completeHabit(habitId: $habitId, date: $date, notes: $notes, evidence: $evidence): HabitCompletion!
}
```

**Reflection Mutations:**

```graphql
mutation CreateReflection($input: CreateReflectionInput!) {
  createReflection(input: $input): Reflection!
}

mutation CreateWeeklyReflection($input: CreateWeeklyReflectionInput!) {
  createWeeklyReflection(input: $input): Reflection!
}

mutation AddReflectionFeedback($reflectionId: ID!, $feedback: String!) {
  addReflectionFeedback(reflectionId: $reflectionId, feedback: $feedback): Reflection!
}
```

**Feedback Mutations:**

```graphql
mutation SubmitSessionFeedback($input: SessionFeedbackInput!) {
  submitSessionFeedback(input: $input): SessionFeedback!
}
```

**Event Mutations:**

```graphql
mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input): Event!
}

mutation RegisterForEvent($eventId: ID!) {
  registerForEvent(eventId: $eventId): EventAttendance!
}

mutation CancelEventRegistration($eventId: ID!) {
  cancelEventRegistration(eventId: $eventId): EventAttendance!
}
```

**Notification Mutations:**

```graphql
mutation MarkNotificationRead($notificationId: ID!) {
  markNotificationRead(notificationId: $notificationId): Notification!
}

mutation MarkAllNotificationsRead($userId: ID!) {
  markAllNotificationsRead(userId: $userId): Int!
}
```

---

## DynamoDB Indexes

### Global Secondary Indexes (GSI)

**Users Table:**

**GSI 1: UsersByEmail**
- **Table**: `Users`
- **PK**: `email`
- **SK**: (none)
- **Purpose**: Look up user by email (login, user search)
- **Projection**: All attributes

**GSI 2: UsersByUsername**
- **Table**: `Users`
- **PK**: `username`
- **SK**: (none)
- **Purpose**: Look up user by username
- **Projection**: All attributes

**GSI 3: UsersByRole**
- **Table**: `Users`
- **PK**: `role`
- **SK**: `createdAt`
- **Purpose**: List users by role (e.g., all mentors)
- **Projection**: All attributes

**GSI 4: UsersByInterest**
- **Table**: `Users`
- **PK**: `interest` (individual interest value from Set)
- **SK**: `createdAt`
- **Purpose**: Search users by interest (e.g., find all users interested in "Product Design")
- **Projection**: All attributes
- **Note**: Requires denormalization - each user interest creates a separate GSI entry

---

**Sessions Table:**

**GSI 1: SessionsByMentor**
- **Table**: `Sessions`
- **PK**: `mentorId`
- **SK**: `date`
- **Purpose**: Query all sessions for a mentor, sorted by date
- **Projection**: All attributes

**GSI 2: SessionsByMentee**
- **Table**: `Sessions`
- **PK**: `menteeId`
- **SK**: `date`
- **Purpose**: Query all sessions for a mentee, sorted by date
- **Projection**: All attributes

**GSI 3: SessionsByStatus**
- **Table**: `Sessions`
- **PK**: `status`
- **SK**: `date`
- **Purpose**: Query sessions by status (e.g., all pending sessions)
- **Projection**: All attributes

**GSI 4: SessionsByVenue**
- **Table**: `Sessions`
- **PK**: `venueId`
- **SK**: `date`
- **Purpose**: Query all sessions at a venue
- **Projection**: All attributes

---

**Goals Table:**

**GSI 1: GoalsByUser**
- **Table**: `Goals`
- **PK**: `userId`
- **SK**: `createdAt`
- **Purpose**: Query all goals for a user
- **Projection**: All attributes

**GSI 2: GoalsByStatus**
- **Table**: `Goals`
- **PK**: `status`
- **SK**: `createdAt`
- **Purpose**: Query goals by status
- **Projection**: All attributes

**GSI 3: GoalsByMentor**
- **Table**: `Goals`
- **PK**: `mentorId`
- **SK**: `createdAt`
- **Purpose**: Query all goals assigned to a mentor
- **Projection**: All attributes

---

**Habits Table:**

**GSI 1: HabitsByUser**
- **Table**: `Habits`
- **PK**: `userId`
- **SK**: `createdAt`
- **Purpose**: Query all habits for a user
- **Projection**: All attributes

**GSI 2: HabitsByGoal**
- **Table**: `Habits`
- **PK**: `goalId`
- **SK**: `createdAt`
- **Purpose**: Query all habits for a goal
- **Projection**: All attributes

**GSI 3: HabitsByStatus**
- **Table**: `Habits`
- **PK**: `status`
- **SK**: `createdAt`
- **Purpose**: Query habits by status (e.g., all active habits)
- **Projection**: All attributes

---

**HabitCompletions Table:**

**GSI 1: CompletionsByUser**
- **Table**: `HabitCompletions`
- **PK**: `userId`
- **SK**: `date`
- **Purpose**: Query all completions for a user, sorted by date
- **Projection**: All attributes

---

**Reflections Table:**

**GSI 1: ReflectionsByGoal**
- **Table**: `Reflections`
- **PK**: `goalId`
- **SK**: `date`
- **Purpose**: Query all reflections for a goal
- **Projection**: All attributes

**GSI 2: ReflectionsByShared**
- **Table**: `Reflections`
- **PK**: `sharedWithMentorId`
- **SK**: `date`
- **Purpose**: Query all shared reflections for a mentor
- **Projection**: All attributes

---

**SessionFeedbacks Table:**

**GSI 1: FeedbacksByMentor**
- **Table**: `SessionFeedbacks`
- **PK**: `mentorId`
- **SK**: `createdAt`
- **Purpose**: Query all feedbacks for a mentor
- **Projection**: All attributes

**GSI 2: FeedbacksByMentee**
- **Table**: `SessionFeedbacks`
- **PK**: `menteeId`
- **SK**: `createdAt`
- **Purpose**: Query all feedbacks submitted by a mentee
- **Projection**: All attributes

---

**Reviews Table:**

**GSI 1: ReviewsByAuthor**
- **Table**: `Reviews`
- **PK**: `authorId`
- **SK**: `createdAt`
- **Purpose**: Query all reviews written by a user
- **Projection**: All attributes

**Note**: Primary table structure uses `PK = targetId` and `SK = authorId`, allowing efficient queries for "all reviews for a target" without needing a GSI. GSI is only needed for "reviews by author" pattern.

---

**Events Table:**

**GSI 1: EventsByDate**
- **Table**: `Events`
- **PK**: `date` (date portion only)
- **SK**: `date` (full datetime)
- **Purpose**: Query events by date range
- **Projection**: All attributes

**GSI 2: EventsByHost**
- **Table**: `Events`
- **PK**: `hostId`
- **SK**: `date`
- **Purpose**: Query all events hosted by a user
- **Projection**: All attributes

**GSI 3: EventsByType**
- **Table**: `Events`
- **PK**: `type`
- **SK**: `date`
- **Purpose**: Query events by type
- **Projection**: All attributes

**GSI 4: EventsByVenue**
- **Table**: `Events`
- **PK**: `venueId`
- **SK**: `date`
- **Purpose**: Query all events at a venue
- **Projection**: All attributes

---

**EventAttendances Table:**

**GSI 1: AttendancesByUser**
- **Table**: `EventAttendances`
- **PK**: `userId`
- **SK**: `createdAt`
- **Purpose**: Query all event attendances for a user
- **Projection**: All attributes

---

**Badges Table:**

**GSI 1: BadgesByType**
- **Table**: `Badges`
- **PK**: `type`
- **SK**: `earnedAt`
- **Purpose**: Query badges by type
- **Projection**: All attributes

---

**Notifications Table:**

**GSI 1: NotificationsByType**
- **Table**: `Notifications`
- **PK**: `type`
- **SK**: `createdAt`
- **Purpose**: Query notifications by type
- **Projection**: All attributes

---

**Todos Table:**

**GSI 1: TodosByGoal**
- **Table**: `Todos`
- **PK**: `goalId`
- **SK**: `createdAt`
- **Purpose**: Query all todos for a goal
- **Projection**: All attributes

---

**MentorSessionNotes Table:**

**GSI 1: NotesByMentor**
- **Table**: `MentorSessionNotes`
- **PK**: `mentorId`
- **SK**: `createdAt`
- **Purpose**: Query all notes for a mentor
- **Projection**: All attributes

---

## Authorization Model

### User-Level Access

- **Owner**: Full read/write access to own data
- **Public**: Read-only access to public fields (name, avatar, bio, rating)
- **Mentor**: Read access to shared reflections and goals of assigned mentees

### Session-Level Access

- **Mentor**: Full read/write access to own sessions
- **Mentee**: Full read/write access to own sessions
- **Non-Participant**: No access

### Goal & Habit Access

- **Owner**: Full CRUD access
- **Mentor**: Read access if assigned (`mentorId` matches)
- **Non-Assigned**: No access

### Reflection Access

- **Owner**: Full CRUD access
- **Mentor**: Read access if `isShared = true` and `sharedWithMentorId` matches
- **Non-Shared**: No access

### Feedback Access

- **Mentee**: Create feedback for own sessions
- **Mentor**: Read own feedbacks
- **Anonymous**: If `isAnonymous = true`, mentor cannot see mentee identity

---

## Database Design Approaches: Multi-Table vs Single Table

### Current Approach: Multi-Table Design

The design above uses **separate DynamoDB tables** for each entity type (Users, Sessions, Goals, Habits, Reflections, etc.).

**Structure**:
- 17 separate tables (Users, Categories, UserCategories, Sessions, Venues, Goals, Habits, HabitCompletions, Reflections, SessionFeedbacks, Reviews, Events, EventAttendances, Badges, Notifications, Todos, MentorSessionNotes)
- Simple PK/SK patterns per table
- Straightforward entity mapping

### Alternative: Single Table Design

**Single Table Structure**: `GrowlinkData`

All entities stored in one table using composite keys:

| Entity | PK | SK | Attributes |
|--------|----|----|------------|
| User | `USER#<userId>` | `METADATA` | email, name, avatar, bio, preferences |
| Category | `CATEGORY#<categoryId>` | `METADATA` | name, description, icon |
| UserCategory | `USER#<userId>` | `CATEGORY#<categoryId>` | (relationship) |
| Session | `SESSION#<sessionId>` | `METADATA` | mentorId, menteeId, date, status, etc. |
| Goal | `USER#<userId>` | `GOAL#<goalId>` | title, description, status, progress |
| Habit | `USER#<userId>` | `HABIT#<habitId>` | title, frequency, duration, cue |
| HabitCompletion | `HABIT#<habitId>` | `DATE#<date>` | completed, notes, evidence |
| Reflection | `USER#<userId>` | `DATE#<date>` | mood, text, content, isShared |
| Event | `EVENT#<eventId>` | `METADATA` | title, date, hostId, type |
| Badge | `USER#<userId>` | `BADGE#<earnedAt>` | type, title, description |

**GSI Structure**:
- **GSI1**: Mentor access pattern
  - PK: `MENTOR#<mentorId>`, SK: `SESSION#<sessionId>`
- **GSI2**: Email lookup
  - PK: `email`, SK: (none)
- **GSI3**: Date-based queries
  - PK: `DATE#<date>`, SK: `SESSION#<sessionId>`

---

### Trade-Off Comparison

#### Multi-Table Design

**Advantages**:
- **Simpler mental model**: One entity type per table, easier to understand
- **Easier to reason about**: Clear separation of concerns
- **Better for beginners**: Resembles traditional relational database patterns
- **IAM granularity**: Can set different permissions per table
- **Schema evolution**: Easier to modify one entity without affecting others
- **Amplify integration**: Works naturally with Amplify DataStore @model directives
- **Debugging**: Easier to inspect and troubleshoot individual entity types
- **Type safety**: Each table has a clear schema, easier to validate

**Disadvantages**:
- **Multiple network calls**: Fetching related data requires separate queries to different tables
- **No transactions across tables**: DynamoDB transactions limited to 100 items, harder to coordinate
- **Higher read costs**: Each table query counts as separate read capacity units
- **Slower queries**: Network latency multiplied by number of tables accessed
- **More complex application logic**: Need to orchestrate multiple table reads/writes

---

#### Single Table Design

**Advantages**:
- **Atomic operations**: All related data in one table enables transactions for related entities
- **Query efficiency**: Fetch user with all goals/habits in one query
- **Lower costs**: Fewer read/write operations overall
- **Better performance**: Single network round-trip for hierarchical data
- **Reduced GSI overhead**: Fewer indexes needed across the application
- **Scalability**: Better at scale for applications with complex access patterns

**Disadvantages**:
- **Steep learning curve**: Requires understanding DynamoDB-specific patterns
- **Complex key design**: PK/SK patterns must be carefully planned upfront
- **Harder to modify**: Schema changes require careful migration planning
- **Type mixing**: Single table contains heterogeneous data, harder to validate
- **Debugging difficulty**: More complex to query and inspect in console
- **Amplify limitations**: Doesn't map cleanly to Amplify's @model approach
- **Over-fetching risk**: May retrieve more data than needed if not carefully designed

---

### Recommendation for GrowlinkApp (Startup Context)

**Decision: Multi-Table Design** - **STRONGLY RECOMMENDED**

#### Startup-Specific Analysis

**Why Multi-Table is Critical for Startups**:

1. **Speed to Market > Optimization**
   - Multi-table: Ship in weeks
   - Single table: Spend weeks designing perfect key patterns before writing code
   - **Reality**: Your access patterns WILL change based on user feedback

2. **Cost is Negligible at Startup Scale**
   - First 1,000 users ≈ $5-15/month regardless of approach
   - DynamoDB free tier: 25GB storage, 25 WCU, 25 RCU
   - "Higher costs" of multi-table is theoretical - you won't hit it for months/years
   - **Don't optimize for problems you don't have**

3. **Iteration Speed is Everything**
   - Multi-table: Change schema in 10 minutes
   - Single table: Rethink PK/SK patterns, migrate data, update GSIs
   - **Startups pivot** - your data model will evolve

4. **Developer Velocity**
   - New developer productive in 1 day vs 1 week learning DynamoDB patterns
   - Easy to debug, easy to reason about
   - Less mental overhead = faster feature development

5. **Amplify Integration**
   - Multi-table works seamlessly with Amplify Gen 2
   - Single table requires custom resolvers and manual DynamoDB operations
   - **More boilerplate = slower shipping**

#### The Single Table Trap for Startups

Single table design is **premature optimization**. You're solving for:
- Scale you don't have (millions of requests)
- Costs you won't incur ($100s/month in DynamoDB)
- Performance requirements that don't exist yet (sub-100ms queries)

**The real cost**: Weeks of development time and reduced agility when you should be validating product-market fit.

#### Migration Path

**When to Actually Consider Single Table**:
- **Revenue indicator**: $50K+ MRR (proves you have a business worth optimizing)
- **Scale indicator**: 10K+ active users/month
- **Cost indicator**: DynamoDB bill >$500/month
- **Performance indicator**: P95 query latency >1 second
- **Team indicator**: Have hired a senior backend engineer with DynamoDB expertise

**Truth**: 90% of startups never reach these thresholds. If you do, congratulations - you can afford the migration.

#### Bottom Line

**Use multi-table design. Ship fast. Validate your idea. Optimize later when data proves it's necessary.**

The best database design is the one that gets your product in users' hands fastest.

---

## Next Steps

1. **Implement GraphQL Schema** in `amplify/data/resource.ts`
2. **Create DynamoDB Tables** via Amplify backend
3. **Set up Authorization Rules** (@auth directives)
4. **Generate TypeScript Types** from schema
5. **Create API Service Layer** in React for queries/mutations
6. **Update Context/State Management** to use API instead of mock data
7. **Implement Background Jobs** for badge calculation, notification sending, AI insights
8. **Add Monitoring & Logging** for API performance and errors
