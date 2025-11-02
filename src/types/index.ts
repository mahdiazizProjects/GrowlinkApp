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


