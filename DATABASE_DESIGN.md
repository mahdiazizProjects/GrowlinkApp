# Database Design for GrowlinkApp

Based on the user's requirements and the existing frontend types, here is the proposed database schema. This is designed to be compatible with AWS Amplify (GraphQL) or a relational database.

## 1. Users & Profiles

**User**
- `id`: ID!
- `email`: String!
- `name`: String!
- `role`: UserRole! (MENTOR | MENTEE | BOTH)
- `bio`: String
- `avatar`: String
- `location`: String
- `skills`: [String]
- `interests`: [String]
- `mentorshipCategories`: [Category] @manyToMany
- `createdAt`: AWSDateTime!

**Category** (Mentorship Categories like Career, Fitness, Wellness, Relationship)
- `id`: ID!
- `name`: String!
- `description`: String

## 2. Mentorship & Sessions

**Session**
- `id`: ID!
- `mentorId`: ID!
- `menteeId`: ID!
- `date`: AWSDateTime!
- `duration`: Int! (minutes)
- `status`: SessionStatus! (PENDING | CONFIRMED | COMPLETED | CANCELLED)
- `notes`: String
- `meetingLink`: String

## 3. Reflections (Mood & Journaling)

**Reflection**
- `id`: ID!
- `userId`: ID! (The Mentee)
- `date`: AWSDate!
- `mood`: Mood! (GREAT | GOOD | NEUTRAL | BAD | AWFUL)
- `moodScore`: Int (1-10)
- `content`: String (Journal entry/notes)
- `isShared`: Boolean! (If true, visible to Mentor)
- `sharedWithMentorId`: ID (Optional, specific mentor to share with)
- `mentorFeedback`: String (Feedback from mentor if shared)
- `createdAt`: AWSDateTime!

## 4. Reviews & Feedback

**Review** (General reviews for Mentors/Mentees)
- `id`: ID!
- `authorId`: ID!
- `targetId`: ID!
- `rating`: Int! (1-5)
- `comment`: String
- `type`: ReviewType! (SESSION_FEEDBACK | GENERAL)
- `createdAt`: AWSDateTime!

## 5. Action Plan (Goals & Habits)

**ActionPlan** (Container for goals/actions)
- `id`: ID!
- `creatorId`: ID! (Mentor or Mentee)
- `assigneeId`: ID! (Mentee)
- `title`: String!
- `description`: String
- `startDate`: AWSDate
- `endDate`: AWSDate
- `status`: PlanStatus! (ACTIVE | COMPLETED | ARCHIVED)

**ActionItem** (Specific actions to take or avoid)
- `id`: ID!
- `planId`: ID!
- `title`: String!
- `description`: String
- `type`: ActionType! (DO | AVOID)
- `frequency`: Frequency! (DAILY | WEEKLY | ONE_TIME)
- `status`: ActionStatus! (ACTIVE | PAUSED | COMPLETED)

**ProgressReport** (Tracking completion of actions)
- `id`: ID!
- `actionItemId`: ID!
- `date`: AWSDate!
- `status`: CompletionStatus! (COMPLETED | MISSED | SKIPPED)
- `notes`: String
- `evidence`: String (Link to proof/image)

## Enums

- **UserRole**: MENTOR, MENTEE, BOTH
- **Mood**: GREAT, GOOD, NEUTRAL, BAD, AWFUL
- **ActionType**: DO, AVOID
- **Frequency**: DAILY, WEEKLY, ONE_TIME
