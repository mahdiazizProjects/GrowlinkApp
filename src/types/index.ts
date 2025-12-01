export interface User {
  id: string;
  username: string;
  name: string;
  title?: string;
  email: string;
  role: 'MENTOR' | 'MENTEE' | 'BOTH' | 'mentor' | 'mentee';
  avatar?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  mentorshipCategories?: Category[];
  membershipTier?: 'standard' | 'premium' | 'exclusive';
  verified?: boolean;
  rating?: number;
  totalSessions?: number;
  inPersonSessions?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Venue {
  id: string;
  name: string;
  type: 'library' | 'co-working' | 'cafe' | 'community-center';
  address: string;
  city: string;
  capacity: number;
  amenities: string[];
  image: string;
  isPartner: boolean;
  partnershipTier: 'bronze' | 'silver' | 'gold';
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  mentor?: User;
  mentee?: User;
  type: 'virtual' | 'in-person';
  venueId?: string;
  venue?: Venue;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: number;
  topic?: string;
  rating?: number;
  review?: string;
  feedbackEligible?: boolean;
  feedbackSubmitted?: boolean;
  feedbackSubmittedAt?: string;
  notes?: string;
  meetingLink?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'hangout' | 'workshop' | 'networking' | 'casual-meetup';
  venueId?: string;
  venue?: Venue;
  hostId: string;
  host: User;
  date: string;
  time: string;
  duration: number;
  maxAttendees: number;
  attendees: string[];
  isVirtual: boolean;
  price: number;
  tags: string[];
  image?: string;
}

export interface Reflection {
  id: string;
  userId: string;
  date: string;
  goalId?: string;
  week?: string; // Legacy field
  mood: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'AWFUL';
  moodScore?: number;
  text?: string; // Simple text field for daily reflections
  content?: {
    whatWentWell?: string;
    whatFeltHard?: string;
    insights?: string;
  } | string; // Allow both for compatibility
  isShared: boolean;
  sharedWithMentorId?: string;
  mentorFeedback?: {
    mentorId: string;
    feedback: string;
    createdAt: string;
  } | string; // Allow both
  aiInsights?: string; // Legacy field
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment?: string;
  type: 'SESSION_FEEDBACK' | 'GENERAL';
  createdAt: string;
}

export interface ActionPlan {
  id: string;
  creatorId: string;
  assigneeId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  items?: ActionItem[];
  createdAt?: string;
}

export interface ActionItem {
  id: string;
  planId: string;
  title: string;
  description?: string;
  type: 'DO' | 'AVOID';
  frequency: 'DAILY' | 'WEEKLY' | 'ONE_TIME';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  progress?: ProgressReport[];
}

export interface ProgressReport {
  id: string;
  actionItemId: string;
  date: string;
  status: 'COMPLETED' | 'MISSED' | 'SKIPPED';
  notes?: string;
  evidence?: string;
}

// Legacy types kept for compatibility if needed, but ideally should be refactored
export interface Badge {
  id: string;
  userId: string;
  type: 'consistency' | 'reflection' | 'identity-builder' | 'streak' | 'milestone';
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'session-booked' | 'session-upcoming' | 'feedback-received' | 'badge-earned' | 'admin-update';
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

// Legacy types restored for compatibility
export interface Goal {
  id: string;
  userId: string;
  identity?: string; // Keep for backward compatibility
  title: string;
  description?: string;
  category?: string;
  progress?: number; // 0-100
  dueDate?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'draft' | 'pending-approval' | 'active' | 'completed' | 'archived';
  mentorId?: string;
  createdAt?: string;
  updatedAt?: string;
  todos?: Todo[];
}

export interface Habit {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  duration: number;
  cue: {
    time?: string;
    place?: string;
    context?: string;
  };
  reward?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  goalId?: string;
  text: string;
  done?: boolean;
  dueDate?: string;
  createdAt?: string;
}

export interface SessionFeedback {
  id: string;
  sessionId: string;
  menteeId: string;
  mentorId: string;
  rating: number;
  growthArea: string;
  growthIdea: string;
  whatWentWell: string;
  whatToImprove: string;
  additionalComments?: string;
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorFeedbackStats {
  mentorId: string;
  averageRating: number;
  totalFeedbacks: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentFeedbacks: SessionFeedback[];
}

export interface MentorSessionNotes {
  id: string;
  sessionId: string;
  mentorId: string;
  summary: string;
  followUps: string;
  growthFocus?: string;
  privateNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorStats {
  mentorId: string;
  averageRating: number;
  totalSessions: number;
  totalFeedbacks: number;
  strengthKeywords: string[];
  improvementKeywords: string[];
  sessionsPerWeek: number;
  feedbackResponseRate: number;
  lastUpdated: string;
}

export interface MenteeSummary {
  menteeId: string;
  mentee: User;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  lastSessionDate?: string;
  mentorNotes?: string;
}

export interface Rating {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  isInPerson: boolean;
  createdAt: string;
}
