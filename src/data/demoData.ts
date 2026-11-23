// Demo dataset used ONLY in local mode (no amplify_outputs.json), so the app has something to
// show on first run. None of this is written to a cloud backend. Ratings and session counts are
// deliberately absent: those are always computed from real feedback and sessions.

type Rec = Record<string, unknown>

const day = (offset: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const DEMO_VENUES: Rec[] = [
  {
    id: 'venue-central-library',
    name: 'Central Library',
    type: 'LIBRARY',
    address: '123 Main St',
    city: 'New York',
    capacity: 50,
    amenities: ['WiFi', 'Meeting Rooms', 'Coffee', 'Parking'],
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    isPartner: true,
    partnershipTier: 'GOLD'
  },
  {
    id: 'venue-techhub',
    name: 'TechHub Co-working',
    type: 'CO_WORKING',
    address: '456 Innovation Ave',
    city: 'San Francisco',
    capacity: 30,
    amenities: ['WiFi', 'Phone Booths', 'Kitchen', 'Printing'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    isPartner: true,
    partnershipTier: 'SILVER'
  },
  {
    id: 'venue-community-center',
    name: 'Community Center Downtown',
    type: 'COMMUNITY_CENTER',
    address: '789 Community Way',
    city: 'Seattle',
    capacity: 100,
    amenities: ['WiFi', 'Large Hall', 'Kitchen', 'Parking'],
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    isPartner: true,
    partnershipTier: 'BRONZE'
  }
]

export const DEMO_MENTORS: Rec[] = [
  {
    id: 'demo-mentor-sarah',
    username: 'sarahchen',
    name: 'Sarah Chen (demo)',
    email: 'sarah@example.com',
    title: 'Senior Product Designer',
    role: 'MENTOR',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Senior Product Designer with 10+ years in tech. Specialized in UX research and design systems.',
    location: 'San Francisco, CA',
    skills: ['Product Design', 'UX Research', 'Design Systems', 'Leadership']
  },
  {
    id: 'demo-mentor-marcus',
    username: 'marcusjohnson',
    name: 'Marcus Johnson (demo)',
    email: 'marcus@example.com',
    title: 'Engineering Leader',
    role: 'MENTOR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Tech executive and startup advisor. Passionate about helping others navigate tech careers.',
    location: 'New York, NY',
    skills: ['Engineering Leadership', 'Startups', 'Product Strategy', 'Career Growth']
  },
  {
    id: 'demo-mentor-priya',
    username: 'priyapatel',
    name: 'Priya Patel (demo)',
    email: 'priya@example.com',
    title: 'Data Scientist',
    role: 'MENTOR',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Data scientist and ML engineer building AI products for healthcare.',
    location: 'Seattle, WA',
    skills: ['Data Science', 'Machine Learning', 'Python', 'Career Growth']
  },
  {
    id: 'demo-mentor-david',
    username: 'davidkim',
    name: 'David Kim (demo)',
    email: 'david@example.com',
    title: 'Marketing Strategist',
    role: 'MENTOR',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Marketing strategist and brand builder for consumer products.',
    location: 'Austin, TX',
    skills: ['Marketing', 'Brand Strategy', 'Growth', 'Content']
  }
]

export function buildDemoEvents(): Rec[] {
  return [
    {
      id: 'demo-event-coffee',
      title: 'Designer Coffee & Connect',
      description: 'Casual meetup for designers to share projects and ideas over coffee.',
      type: 'CASUAL_MEETUP',
      venueId: 'venue-community-center',
      hostId: 'demo-mentor-sarah',
      date: day(7),
      time: '10:00',
      duration: 120,
      maxAttendees: 20,
      attendees: [],
      isVirtual: false,
      price: 0,
      tags: ['Design', 'Networking'],
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
    },
    {
      id: 'demo-event-career',
      title: 'Tech Career Workshop',
      description: 'Interactive workshop on building your tech career path and negotiating offers.',
      type: 'WORKSHOP',
      venueId: 'venue-techhub',
      hostId: 'demo-mentor-marcus',
      date: day(14),
      time: '14:00',
      duration: 180,
      maxAttendees: 30,
      attendees: [],
      isVirtual: false,
      price: 0,
      tags: ['Career', 'Workshop'],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    },
    {
      id: 'demo-event-ama',
      title: 'Ask Me Anything: Breaking into Data Science',
      description: 'A virtual Q&A for anyone curious about moving into data roles.',
      type: 'NETWORKING',
      hostId: 'demo-mentor-priya',
      date: day(21),
      time: '18:00',
      duration: 60,
      maxAttendees: 100,
      attendees: [],
      isVirtual: true,
      price: 0,
      tags: ['Data', 'Virtual']
    }
  ]
}
