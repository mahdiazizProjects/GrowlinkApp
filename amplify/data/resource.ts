import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a.model({
    username: a.string().required(),
    email: a.string().required(),
    name: a.string().required(),
    title: a.string(),
    role: a.enum(['MENTOR', 'MENTEE', 'BOTH']),
    bio: a.string(),
    avatar: a.string(),
    location: a.string(),
    skills: a.string().array(),
    interests: a.string().array(),
    mentorshipCategories: a.hasMany('Category', 'userId'),
    reflections: a.hasMany('Reflection', 'userId'),
    goals: a.hasMany('Goal', 'userId'),
    todos: a.hasMany('Todo', 'userId'),
    actionPlans: a.hasMany('ActionPlan', 'creatorId'),
    assignedPlans: a.hasMany('ActionPlan', 'assigneeId'),
    reviewsWritten: a.hasMany('Review', 'authorId'),
    reviewsReceived: a.hasMany('Review', 'targetId'),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Category: a.model({
    name: a.string().required(),
    description: a.string(),
    userId: a.id(),
    user: a.belongsTo('User', 'userId'),
  }).authorization(allow => [allow.publicApiKey()]),

  Session: a.model({
    mentorId: a.id().required(),
    menteeId: a.id().required(),
    date: a.datetime().required(),
    duration: a.integer().required(),
    status: a.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
    notes: a.string(),
    meetingLink: a.string(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Reflection: a.model({
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    date: a.date().required(),
    mood: a.enum(['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'AWFUL']),
    moodScore: a.integer(),
    text: a.string(),
    content: a.string(), // Keep for backward compatibility
    isShared: a.boolean().required(),
    sharedWithMentorId: a.id(),
    mentorFeedback: a.string(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Goal: a.model({
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    title: a.string().required(),
    description: a.string(),
    category: a.string(),
    progress: a.integer(),
    dueDate: a.date(),
    todos: a.hasMany('Todo', 'goalId'),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Todo: a.model({
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    goalId: a.id(),
    goal: a.belongsTo('Goal', 'goalId'),
    text: a.string().required(),
    done: a.boolean(),
    dueDate: a.date(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Review: a.model({
    authorId: a.id().required(),
    author: a.belongsTo('User', 'authorId'),
    targetId: a.id().required(),
    target: a.belongsTo('User', 'targetId'),
    rating: a.integer().required(),
    comment: a.string(),
    type: a.enum(['SESSION_FEEDBACK', 'GENERAL']),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  ActionPlan: a.model({
    creatorId: a.id().required(),
    creator: a.belongsTo('User', 'creatorId'),
    assigneeId: a.id().required(),
    assignee: a.belongsTo('User', 'assigneeId'),
    title: a.string().required(),
    description: a.string(),
    startDate: a.date(),
    endDate: a.date(),
    status: a.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']),
    items: a.hasMany('ActionItem', 'planId'),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  ActionItem: a.model({
    planId: a.id().required(),
    plan: a.belongsTo('ActionPlan', 'planId'),
    title: a.string().required(),
    description: a.string(),
    type: a.enum(['DO', 'AVOID']),
    frequency: a.enum(['DAILY', 'WEEKLY', 'ONE_TIME']),
    status: a.enum(['ACTIVE', 'PAUSED', 'COMPLETED']),
    progress: a.hasMany('ProgressReport', 'actionItemId'),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  ProgressReport: a.model({
    actionItemId: a.id().required(),
    actionItem: a.belongsTo('ActionItem', 'actionItemId'),
    date: a.date().required(),
    status: a.enum(['COMPLETED', 'MISSED', 'SKIPPED']),
    notes: a.string(),
    evidence: a.string(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
