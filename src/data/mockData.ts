import { User, Event } from '../types'

export const mockMentors: User[] = [
  {
    id: '1',
    username: 'sarahchen',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Senior Product Designer with 10+ years at top tech companies. Specialized in UX research and design systems.',
    location: 'San Francisco, CA',
    skills: ['Product Design', 'UX Research', 'Design Systems', 'Leadership'],
    membershipTier: 'exclusive',
    verified: true,
    rating: 4.9,
    totalSessions: 127,
    inPersonSessions: 89,
    createdAt: '2023-01-15'
  },
  {
    id: '2',
    username: 'marcusjohnson',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Tech executive and startup advisor. Former CTO at two unicorn startups. Passionate about helping others navigate tech careers.',
    location: 'New York, NY',
    skills: ['Engineering Leadership', 'Startups', 'Product Strategy', 'Career Growth'],
    membershipTier: 'premium',
    verified: true,
    rating: 4.8,
    totalSessions: 203,
    inPersonSessions: 156,
    createdAt: '2022-11-20'
  },
  {
    id: '3',
    username: 'priyapatel',
    name: 'Priya Patel',
    email: 'priya@example.com',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Data scientist and ML engineer. Building AI products for healthcare. Love mentoring women in tech.',
    location: 'Seattle, WA',
    skills: ['Data Science', 'Machine Learning', 'Python', 'Career Growth'],
    membershipTier: 'exclusive',
    verified: true,
    rating: 5.0,
    totalSessions: 94,
    inPersonSessions: 72,
    createdAt: '2023-03-10'
  },
  {
    id: '4',
    username: 'davidkim',
    name: 'David Kim',
    email: 'david@example.com',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Marketing strategist and brand builder. Helped scale multiple consumer brands from 0 to millions in revenue.',
    location: 'Austin, TX',
    skills: ['Marketing', 'Brand Strategy', 'Growth Hacking', 'Content'],
    membershipTier: 'premium',
    verified: true,
    rating: 4.7,
    totalSessions: 168,
    inPersonSessions: 102,
    createdAt: '2022-09-05'
  }
]

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Designer Coffee & Connect',
    description: 'Casual meetup for designers to share projects and ideas over coffee.',
    type: 'casual-meetup',
    venueId: '3',
    hostId: '1',
    host: mockMentors[0],
    date: '2024-01-20',
    time: '10:00',
    duration: 120,
    maxAttendees: 20,
    attendees: ['1', '2', '3'],
    isVirtual: false,
    price: 0,
    tags: ['Design', 'Networking', 'Casual'],
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
  },
  {
    id: '2',
    title: 'Tech Career Workshop',
    description: 'Interactive workshop on building your tech career path and negotiating offers.',
    type: 'workshop',
    venueId: '2',
    hostId: '2',
    host: mockMentors[1],
    date: '2024-01-25',
    time: '14:00',
    duration: 180,
    maxAttendees: 30,
    attendees: ['1', '2'],
    isVirtual: false,
    price: 25,
    tags: ['Career', 'Workshop', 'Professional Development'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  }
]


