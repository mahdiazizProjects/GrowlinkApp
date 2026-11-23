import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*
 * Access rules
 * ------------
 * Signed-in calls use the Cognito user pool; signed-out visitors use the public API key, which only
 * reads public catalogue data (mentor profiles, availability, venues, events, ratings, booked slots)
 * and can submit the contact and mentor-application forms.
 *
 * Every user id in this app is the Cognito `sub`, so owner rules compare a record's id field against
 * the caller's `sub` claim. Members of the `ADMIN` Cognito group can manage everything.
 */
const schema = a.schema({
  User: a.model({
    username: a.string().required(),
    // Visible only to the account owner and admins; profile lists use a selection set without it.
    email: a.string().authorization(allow => [
      allow.ownerDefinedIn('id').identityClaim('sub'),
      allow.groups(['ADMIN']),
    ]),
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
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('id').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  Category: a.model({
    name: a.string().required(),
    description: a.string(),
    userId: a.id(),
    user: a.belongsTo('User', 'userId'),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

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
  }).authorization(allow => [
    allow.ownerDefinedIn('menteeId').identityClaim('sub'),
    allow.ownerDefinedIn('mentorId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  Reflection: a.model({
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    date: a.date().required(),
    mood: a.enum(['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'AWFUL']),
    moodScore: a.integer(),
    text: a.string().required(),
    sharedWithMentorId: a.id(),
    mentorFeedback: a.string(),
  }).authorization(allow => [
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.ownerDefinedIn('sharedWithMentorId').identityClaim('sub').to(['read']),
    allow.groups(['ADMIN']),
  ]),

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
  }).authorization(allow => [
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.ownerDefinedIn('mentorId').identityClaim('sub').to(['read', 'update']),
    allow.groups(['ADMIN']),
  ]),

  Todo: a.model({
    userId: a.id().required(),
    user: a.belongsTo('User', 'userId'),
    goalId: a.id(),
    goal: a.belongsTo('Goal', 'goalId'),
    text: a.string().required(),
    done: a.boolean(),
    dueDate: a.date(),
  }).authorization(allow => [
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  Review: a.model({
    authorId: a.id().required(),
    author: a.belongsTo('User', 'authorId'),
    targetId: a.id().required(),
    target: a.belongsTo('User', 'targetId'),
    rating: a.integer().required(),
    comment: a.string(),
    type: a.enum(['SESSION_FEEDBACK', 'GENERAL']),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('authorId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

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
  }).authorization(allow => [
    allow.ownerDefinedIn('creatorId').identityClaim('sub'),
    allow.ownerDefinedIn('assigneeId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  ActionItem: a.model({
    planId: a.id().required(),
    plan: a.belongsTo('ActionPlan', 'planId'),
    title: a.string().required(),
    description: a.string(),
    type: a.enum(['DO', 'AVOID']),
    frequency: a.enum(['DAILY', 'WEEKLY', 'ONE_TIME']),
    status: a.enum(['ACTIVE', 'PAUSED', 'COMPLETED']),
    progress: a.hasMany('ProgressReport', 'actionItemId'),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.owner(),
    allow.groups(['ADMIN']),
  ]),

  ProgressReport: a.model({
    actionItemId: a.id().required(),
    actionItem: a.belongsTo('ActionItem', 'actionItemId'),
    date: a.date().required(),
    status: a.enum(['COMPLETED', 'MISSED', 'SKIPPED']),
    notes: a.string(),
    evidence: a.string(),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.owner(),
    allow.groups(['ADMIN']),
  ]),

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
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  JourneyReaction: a.model({
    journeyId: a.id().required(),
    journey: a.belongsTo('Journey', 'journeyId'),
    userId: a.id().required(),
    type: a.enum(['HEART', 'CELEBRATE', 'SUPPORT']),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  JourneyComment: a.model({
    journeyId: a.id().required(),
    journey: a.belongsTo('Journey', 'journeyId'),
    userId: a.id().required(),
    text: a.string().required(),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  MentorAvailability: a.model({
    mentorId: a.id().required(),
    slots: a.string().required(),
    timezone: a.string(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('mentorId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

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
  }).authorization(allow => [
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  HabitCompletion: a.model({
    habitId: a.id().required(),
    userId: a.id().required(),
    date: a.date().required(),
    completed: a.boolean(),
    notes: a.string(),
  }).authorization(allow => [
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

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
  }).authorization(allow => [
    allow.ownerDefinedIn('menteeId').identityClaim('sub'),
    allow.ownerDefinedIn('mentorId').identityClaim('sub').to(['read']),
    allow.groups(['ADMIN']),
  ]),

  MentorSessionNote: a.model({
    sessionId: a.id().required(),
    mentorId: a.id().required(),
    summary: a.string(),
    followUps: a.string(),
    growthFocus: a.string(),
    privateNotes: a.string(),
  }).authorization(allow => [
    allow.ownerDefinedIn('mentorId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  Notification: a.model({
    userId: a.id().required(),
    title: a.string().required(),
    message: a.string().required(),
    type: a.string(),
    read: a.boolean(),
    relatedId: a.string(),
  }).authorization(allow => [
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    // Lets one participant notify the other (booking requests, approvals, feedback).
    allow.authenticated().to(['create']),
    allow.groups(['ADMIN']),
  ]),

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
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN']),
  ]),

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
    // Legacy: attendance now lives in EventAttendance so attendees never need write access to events.
    attendees: a.id().array(),
    isVirtual: a.boolean(),
    price: a.float(),
    tags: a.string().array(),
    image: a.string(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN']),
  ]),

  SavedMentor: a.model({
    userId: a.id().required(),
    mentorId: a.id().required(),
  }).authorization(allow => [
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),

  MentorshipRequest: a.model({
    menteeId: a.id().required(),
    mentorId: a.id().required(),
    message: a.string(),
    status: a.enum(['PENDING', 'ACCEPTED', 'DECLINED']),
  }).authorization(allow => [
    allow.ownerDefinedIn('menteeId').identityClaim('sub'),
    allow.ownerDefinedIn('mentorId').identityClaim('sub').to(['read', 'update']),
    allow.groups(['ADMIN']),
  ]),

  MentorApplication: a.model({
    userId: a.id(),
    name: a.string().required(),
    email: a.string().required(),
    details: a.json(),
    status: a.enum(['SUBMITTED', 'APPROVED', 'REJECTED']),
  }).authorization(allow => [
    allow.publicApiKey().to(['create']),
    allow.authenticated().to(['create']),
    allow.ownerDefinedIn('userId').identityClaim('sub').to(['read']),
    allow.groups(['ADMIN']),
  ]),

  ContactMessage: a.model({
    userId: a.id(),
    name: a.string().required(),
    email: a.string().required(),
    subject: a.string(),
    message: a.string().required(),
  }).authorization(allow => [
    allow.publicApiKey().to(['create']),
    allow.authenticated().to(['create']),
    allow.groups(['ADMIN']),
  ]),
  // Public, minimal copies of private data, so the app can show availability, ratings and
  // attendance without exposing the records they come from.

  /** One row per pending/confirmed session: lets anyone see a mentor's taken times, nothing else. */
  BookedSlot: a.model({
    sessionId: a.id().required(),
    mentorId: a.id().required(),
    menteeId: a.id().required(),
    startsAt: a.datetime().required(),
    duration: a.integer().required(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('menteeId').identityClaim('sub'),
    // Either participant may create (backfill) or remove the marker for their session.
    allow.ownerDefinedIn('mentorId').identityClaim('sub').to(['read', 'create', 'delete']),
    allow.groups(['ADMIN']),
  ]),

  /** Rating only (no text, no reviewer), keyed by session id so each session counts once. */
  MentorRating: a.model({
    mentorId: a.id().required(),
    rating: a.integer().required(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read', 'create']),
    allow.groups(['ADMIN']),
  ]),

  EventAttendance: a.model({
    eventId: a.id().required(),
    userId: a.id().required(),
  }).authorization(allow => [
    allow.publicApiKey().to(['read']),
    allow.authenticated().to(['read']),
    allow.ownerDefinedIn('userId').identityClaim('sub'),
    allow.groups(['ADMIN']),
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
