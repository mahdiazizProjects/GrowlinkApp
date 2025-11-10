export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'mentee';
  avatar: string;
  bio: string;
  location: string;
  skills: string[];
  membershipTier: 'standard' | 'premium' | 'exclusive';
  verified: boolean;
  rating?: number;
  totalSessions?: number;
  inPersonSessions?: number;
  createdAt: string;
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
  mentor: User;
  mentee: User;
  type: 'virtual' | 'in-person';
  venueId?: string;
  venue?: Venue;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  topic: string;
  rating?: number;
  review?: string;
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

export interface Rating {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1-5
  comment: string;
  isInPerson: boolean;
  createdAt: string;
}

// Habit-Based Mentorship System Types
export interface Goal {
  id: string;
  userId: string;
  identity: string; // "I want to become a [type of person] who [specific action]"
  title: string;
  description?: string;
  status: 'draft' | 'pending-approval' | 'active' | 'completed' | 'archived';
  mentorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  duration: number; // in minutes, should be ≤ 2 min for 1% habits
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
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  userId: string;
  goalId?: string;
  week: string; // YYYY-WW format
  content: {
    whatWentWell?: string;
    whatFeltHard?: string;
    insights?: string;
  };
  mentorFeedback?: {
    mentorId: string;
    feedback: string;
    createdAt: string;
  };
  aiInsights?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Streak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
}

export interface HabitProgress {
  habitId: string;
  completionRate: number; // 0-100
  totalCompletions: number;
  totalDays: number;
  streak: Streak;
}


