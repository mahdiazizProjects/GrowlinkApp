import { User, Event, Reflection } from '../types'

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

export const mockMentees: User[] = [
  {
    id: 'mentee-1',
    username: 'alexrivera',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'mentee',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    bio: 'Aspiring product manager, learning to navigate the tech industry.',
    location: 'Los Angeles, CA',
    membershipTier: 'standard',
    verified: false,
    createdAt: '2024-11-01'
  },
  {
    id: 'mentee-2',
    username: 'emilywong',
    name: 'Emily Wong',
    email: 'emily@example.com',
    role: 'mentee',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bio: 'Junior developer focusing on frontend development.',
    location: 'San Francisco, CA',
    membershipTier: 'premium',
    verified: false,
    createdAt: '2024-10-15'
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

export const mockReflections: Reflection[] = [
  {
    id: 'reflection-1',
    userId: 'mentee-1',
    user: mockMentees[0],
    date: '2024-12-07',
    mood: 'GREAT',
    text: 'Just had an amazing breakthrough today! Finally understood how to structure user stories effectively. My mentor Sarah helped me see that it\'s not just about features, but about the value we bring to users. Feeling so motivated to apply this to my current project! 🚀',
    content: 'Just had an amazing breakthrough today! Finally understood how to structure user stories effectively. My mentor Sarah helped me see that it\'s not just about features, but about the value we bring to users. Feeling so motivated to apply this to my current project! 🚀',
    visibility: 'everyone',
    isShared: true,
    tags: ['learning', 'productmanagement', 'breakthrough'],
    reactions: [
      {
        id: 'reaction-1',
        reflectionId: 'reflection-1',
        userId: '1',
        type: 'celebrate',
        createdAt: '2024-12-07T10:30:00.000Z'
      },
      {
        id: 'reaction-2',
        reflectionId: 'reflection-1',
        userId: '2',
        type: 'heart',
        createdAt: '2024-12-07T11:00:00.000Z'
      },
      {
        id: 'reaction-3',
        reflectionId: 'reflection-1',
        userId: 'mentee-2',
        type: 'celebrate',
        createdAt: '2024-12-07T11:15:00.000Z'
      }
    ],
    comments: [
      {
        id: 'comment-1',
        reflectionId: 'reflection-1',
        userId: '1',
        user: mockMentors[0],
        text: 'So proud of your progress, Alex! You\'re really getting it. Keep up the great work!',
        createdAt: '2024-12-07T10:35:00.000Z'
      }
    ],
    createdAt: '2024-12-07T09:00:00.000Z',
    updatedAt: '2024-12-07T09:00:00.000Z'
  },
  {
    id: 'reflection-2',
    userId: 'mentee-2',
    user: mockMentees[1],
    date: '2024-12-06',
    mood: 'GOOD',
    text: 'Completed my first React component from scratch today without looking at documentation every 5 minutes! Small win, but it feels good. Still struggling with state management though. Any tips?',
    content: 'Completed my first React component from scratch today without looking at documentation every 5 minutes! Small win, but it feels good. Still struggling with state management though. Any tips?',
    visibility: 'everyone',
    isShared: true,
    tags: ['react', 'frontend', 'progress'],
    reactions: [
      {
        id: 'reaction-4',
        reflectionId: 'reflection-2',
        userId: '3',
        type: 'support',
        createdAt: '2024-12-06T16:00:00.000Z'
      },
      {
        id: 'reaction-5',
        reflectionId: 'reflection-2',
        userId: 'mentee-1',
        type: 'heart',
        createdAt: '2024-12-06T16:30:00.000Z'
      }
    ],
    comments: [
      {
        id: 'comment-2',
        reflectionId: 'reflection-2',
        userId: '3',
        user: mockMentors[2],
        text: 'Great progress! For state management, start with useState for local state. Once you\'re comfortable, we can explore useContext and Redux. One step at a time!',
        createdAt: '2024-12-06T16:15:00.000Z'
      }
    ],
    createdAt: '2024-12-06T15:30:00.000Z',
    updatedAt: '2024-12-06T15:30:00.000Z'
  },
  {
    id: 'reflection-3',
    userId: '1',
    user: mockMentors[0],
    date: '2024-12-05',
    mood: 'GREAT',
    text: 'Reflecting on an incredible mentoring session today. Watching my mentees grow and find their confidence is why I do this. To all mentees out there: your journey is unique, embrace the challenges and celebrate every small win. You\'re doing better than you think! 💜',
    content: 'Reflecting on an incredible mentoring session today. Watching my mentees grow and find their confidence is why I do this. To all mentees out there: your journey is unique, embrace the challenges and celebrate every small win. You\'re doing better than you think! 💜',
    visibility: 'everyone',
    isShared: true,
    tags: ['mentorship', 'growth', 'inspiration'],
    reactions: [
      {
        id: 'reaction-6',
        reflectionId: 'reflection-3',
        userId: 'mentee-1',
        type: 'heart',
        createdAt: '2024-12-05T19:00:00.000Z'
      },
      {
        id: 'reaction-7',
        reflectionId: 'reflection-3',
        userId: 'mentee-2',
        type: 'heart',
        createdAt: '2024-12-05T19:15:00.000Z'
      },
      {
        id: 'reaction-8',
        reflectionId: 'reflection-3',
        userId: '2',
        type: 'celebrate',
        createdAt: '2024-12-05T19:30:00.000Z'
      }
    ],
    comments: [
      {
        id: 'comment-3',
        reflectionId: 'reflection-3',
        userId: 'mentee-1',
        user: mockMentees[0],
        text: 'Thank you Sarah! This really means a lot to me right now.',
        createdAt: '2024-12-05T19:05:00.000Z'
      }
    ],
    createdAt: '2024-12-05T18:00:00.000Z',
    updatedAt: '2024-12-05T18:00:00.000Z'
  },
  {
    id: 'reflection-4',
    userId: 'mentee-1',
    user: mockMentees[0],
    date: '2024-12-04',
    mood: 'NEUTRAL',
    text: 'Had a tough day dealing with imposter syndrome. Sometimes I wonder if I\'m cut out for this. But then I remember why I started. Going to take a break, reset, and come back stronger tomorrow.',
    content: 'Had a tough day dealing with imposter syndrome. Sometimes I wonder if I\'m cut out for this. But then I remember why I started. Going to take a break, reset, and come back stronger tomorrow.',
    visibility: 'mentors',
    isShared: true,
    tags: ['impostersyndrome', 'realness', 'selfcare'],
    reactions: [
      {
        id: 'reaction-9',
        reflectionId: 'reflection-4',
        userId: '1',
        type: 'support',
        createdAt: '2024-12-04T20:00:00.000Z'
      },
      {
        id: 'reaction-10',
        reflectionId: 'reflection-4',
        userId: '2',
        type: 'support',
        createdAt: '2024-12-04T20:15:00.000Z'
      }
    ],
    comments: [
      {
        id: 'comment-4',
        reflectionId: 'reflection-4',
        userId: '1',
        user: mockMentors[0],
        text: 'Alex, every single person in tech has felt this way. You ARE cut out for this. Let\'s schedule a call this week to talk through it. You\'re not alone. 💪',
        createdAt: '2024-12-04T20:05:00.000Z'
      },
      {
        id: 'comment-5',
        reflectionId: 'reflection-4',
        userId: '2',
        user: mockMentors[1],
        text: 'Been there many times. Taking a break is exactly the right move. Tomorrow is a new day!',
        createdAt: '2024-12-04T20:20:00.000Z'
      }
    ],
    createdAt: '2024-12-04T19:30:00.000Z',
    updatedAt: '2024-12-04T19:30:00.000Z'
  },
  {
    id: 'reflection-5',
    userId: 'mentee-2',
    user: mockMentees[1],
    date: '2024-12-03',
    mood: 'GOOD',
    text: 'Week 3 of learning JavaScript and I built my first interactive to-do app! It\'s basic, but it WORKS. The feeling of seeing your code come to life never gets old. Thank you to everyone who\'s been supporting me on this journey!',
    content: 'Week 3 of learning JavaScript and I built my first interactive to-do app! It\'s basic, but it WORKS. The feeling of seeing your code come to life never gets old. Thank you to everyone who\'s been supporting me on this journey!',
    visibility: 'everyone',
    isShared: true,
    tags: ['javascript', 'milestone', 'gratitude'],
    reactions: [
      {
        id: 'reaction-11',
        reflectionId: 'reflection-5',
        userId: '3',
        type: 'celebrate',
        createdAt: '2024-12-03T14:00:00.000Z'
      },
      {
        id: 'reaction-12',
        reflectionId: 'reflection-5',
        userId: 'mentee-1',
        type: 'celebrate',
        createdAt: '2024-12-03T14:15:00.000Z'
      }
    ],
    comments: [],
    createdAt: '2024-12-03T13:00:00.000Z',
    updatedAt: '2024-12-03T13:00:00.000Z'
  }
]


