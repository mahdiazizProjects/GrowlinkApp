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
    journeys: a.hasMany('Journey', 'userId'),
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
    type: a.enum(['VIRTUAL', 'IN_PERSON']),
    venueId: a.id(),
    topic: a.string(),
    cancelledAt: a.datetime(),
    cancelledBy: a.enum(['MENTOR', 'MENTEE', 'SYSTEM']),
    cancellationReason: a.string(),
    cancellationRequestedAt: a.datetime(),
    menteeAcceptedCancellation: a.boolean(),
    feedbackSubmitted: a.boolean(),
    feedbackSubmittedAt: a.datetime(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Reflection: a.model({
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    date: a.date().required(),
    mood: a.enum(['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'AWFUL']),
    moodScore: a.integer(),
    text: a.string().required(),
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
    status: a.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
    identity: a.string(),
    mentorId: a.id(),
    todos: a.hasMany('Todo', 'goalId'),
    journeys: a.hasMany('Journey', 'goalId'),
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

  Journey: a.model({
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    goalId: a.id(),
    goal: a.belongsTo('Goal', 'goalId'),
    mood: a.enum(['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'AWFUL']),
    text: a.string().required(),
    visibility: a.enum(['EVERYONE', 'MENTORS', 'PRIVATE', 'SELECTED']),
    selectedMentorIds: a.id().array(),
    tags: a.string().array(),
    reactions: a.hasMany('JourneyReaction', 'journeyId'),
    comments: a.hasMany('JourneyComment', 'journeyId'),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  JourneyReaction: a.model({
    journeyId: a.id().required(),
    journey: a.belongsTo('Journey', 'journeyId'),
    userId: a.id().required(),
    type: a.enum(['HEART', 'CELEBRATE', 'SUPPORT']),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  JourneyComment: a.model({
    journeyId: a.id().required(),
    journey: a.belongsTo('Journey', 'journeyId'),
    userId: a.id().required(),
    text: a.string().required(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  MentorAvailability: a.model({
    mentorId: a.id().required(),
    slots: a.string().required(),
    timezone: a.string(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Habit: a.model({
    userId: a.id().required(),
    goalId: a.id().required(),
    title: a.string().required(),
    description: a.string(),
    frequency: a.enum(['DAILY', 'WEEKLY']),
    duration: a.integer(),
    cueTime: a.string(),
    cuePlace: a.string(),
    cueContext: a.string(),
    reward: a.string(),
    status: a.enum(['ACTIVE', 'PAUSED', 'COMPLETED']),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  HabitCompletion: a.model({
    habitId: a.id().required(),
    userId: a.id().required(),
    date: a.date().required(),
    completed: a.boolean(),
    notes: a.string(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  SessionFeedback: a.model({
    sessionId: a.id().required(),
    menteeId: a.id().required(),
    mentorId: a.id().required(),
    rating: a.integer().required(),
    growthArea: a.string(),
    growthIdea: a.string(),
    whatWentWell: a.string(),
    whatToImprove: a.string(),
    additionalComments: a.string(),
    isAnonymous: a.boolean(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  MentorSessionNote: a.model({
    sessionId: a.id().required(),
    mentorId: a.id().required(),
    summary: a.string(),
    followUps: a.string(),
    growthFocus: a.string(),
    privateNotes: a.string(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Notification: a.model({
    userId: a.id().required(),
    title: a.string().required(),
    message: a.string().required(),
    type: a.string(),
    read: a.boolean(),
    relatedId: a.string(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  Venue: a.model({
    name: a.string().required(),
    type: a.enum(['LIBRARY', 'CO_WORKING', 'CAFE', 'COMMUNITY_CENTER']),
    address: a.string(),
    city: a.string(),
    capacity: a.integer(),
    amenities: a.string().array(),
    image: a.string(),
    isPartner: a.boolean(),
    partnershipTier: a.enum(['BRONZE', 'SILVER', 'GOLD']),
  }).authorization(allow => [allow.publicApiKey()]),

  Event: a.model({
    title: a.string().required(),
    description: a.string(),
    type: a.enum(['HANGOUT', 'WORKSHOP', 'NETWORKING', 'CASUAL_MEETUP']),
    venueId: a.id(),
    hostId: a.id(),
    date: a.date().required(),
    time: a.string(),
    duration: a.integer(),
    maxAttendees: a.integer(),
    attendees: a.id().array(),
    isVirtual: a.boolean(),
    price: a.float(),
    tags: a.string().array(),
    image: a.string(),
  }).authorization(allow => [allow.publicApiKey()]),

  SavedMentor: a.model({
    userId: a.id().required(),
    mentorId: a.id().required(),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  MentorshipRequest: a.model({
    menteeId: a.id().required(),
    mentorId: a.id().required(),
    message: a.string(),
    status: a.enum(['PENDING', 'ACCEPTED', 'DECLINED']),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  MentorApplication: a.model({
    userId: a.id(),
    name: a.string().required(),
    email: a.string().required(),
    details: a.json(),
    status: a.enum(['SUBMITTED', 'APPROVED', 'REJECTED']),
  }).authorization(allow => [allow.publicApiKey(), allow.owner()]),

  ContactMessage: a.model({
    userId: a.id(),
    name: a.string().required(),
    email: a.string().required(),
    subject: a.string(),
    message: a.string().required(),
  }).authorization(allow => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
