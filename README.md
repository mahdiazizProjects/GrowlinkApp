# GrowLink - Exclusive Mentorship & Community Platform

A premium mentorship platform that connects curated mentors and mentees through meaningful in-person and virtual experiences. GrowLink combines traditional mentorship with a **1% Habit-Based Growth System** inspired by Atomic Habits, helping mentees make consistent, measurable progress.

## Core Philosophy

- **Exclusive & Curated**: Limited membership with hand-picked, verified mentors
- **In-Person First**: Partner with libraries, co-working spaces, and community venues
- **Community Hangouts**: Beyond sessions - casual meetups, workshops, and networking events
- **Better Rates**: In-person meetings cost less and earn bonus rating points
- **Premium Experience**: Quality over quantity with a focus on real connections
- **1% Growth System**: Identity-based goals with small, actionable habits that compound over time

## Features

### 🎯 Habit-Based Mentorship (NEW!)

🌱 **Identity-Based Goals**: Define who you want to become, not just what you want to do
- "I want to become a [type of person] who [specific action]"
- Template suggestions for quick start
- Mentor review and approval workflow

📊 **1% Action Plans**: Break big goals into micro-habits
- Small daily/weekly actions (≤ 2 minutes recommended)
- Cue-based habit design (time, place, context)
- Reward system for positive reinforcement

📈 **Habit Tracker Dashboard**: Track your progress daily
- Visual progress rings showing completion rates
- Streak tracking and motivational messages
- Compound growth visualization (+1% per day = 37x per year!)

📝 **Weekly Reflections**: Regular feedback loops
- "What went well? What felt hard?" prompts
- Mentor feedback integration
- AI-generated insights (coming soon)

🏅 **Gamification**: Badges and achievements
- Consistency badges
- Streak milestones
- Identity builder completion

👨‍🏫 **Mentor Dashboard**: Enhanced mentor tools
- Overview of all mentees' habit completion rates
- Reflection summaries and feedback prompts
- AI insights for pattern recognition

### 🏢 Traditional Features

✨ **Exclusive Membership Tiers**: Standard, Premium, and Exclusive memberships with different access levels

🏢 **Partner Venues**: Meet at partnered libraries, co-working spaces, and community centers with discounts

📅 **Community Events**: Join casual hangouts, workshops, and networking meetups

⭐ **Enhanced Ratings**: In-person sessions earn bonus points for better visibility

💰 **Cost Incentives**: Up to 30% discount for in-person sessions at partner venues

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Recharts** for progress visualizations
- **Framer Motion** for animations (installed, ready for use)
- **Zustand** for state management (installed, ready for use)
- **date-fns** for date manipulation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── layout/      # Navbar, Footer, etc.
│   └── habits/      # Habit-based mentorship components
│       ├── IdentityBuilderModal.tsx
│       ├── ActionPlanBuilder.tsx
│       ├── HabitDashboard.tsx
│       ├── ProgressRingChart.tsx
│       ├── ReflectionJournal.tsx
│       ├── BadgeSystem.tsx
│       ├── CueChecklist.tsx
│       └── MentorDashboard.tsx
├── context/         # React Context for state management
├── data/            # Mock data for development
├── pages/           # Page components
│   ├── Goals.tsx
│   ├── Habits.tsx
│   ├── Reflections.tsx
│   └── Dashboard.tsx (enhanced)
├── types/           # TypeScript type definitions
│   └── index.ts (includes Goal, Habit, Reflection, Badge types)
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Available Pages

### Core Pages
- `/` - Home page with featured mentors and features
- `/mentors` - Browse all mentors with search and filters
- `/mentors/:id` - Individual mentor profile
- `/book/:mentorId` - Book a session (virtual or in-person)
- `/community` - Community hub with stats and events
- `/events` - View all upcoming events and hangouts
- `/venues` - Browse partner venues
- `/dashboard` - User dashboard with habit progress overview (requires login)

### Habit-Based Mentorship Pages (NEW!)
- `/goals` - Create and manage identity-based goals
- `/habits` - Daily habit tracker with progress visualization
- `/reflections` - Weekly reflection journal and badge system

## Key Differentiators

1. **1% Habit-Based Growth**: Identity-based goals with small, actionable habits that compound over time
2. **Exclusive Membership**: Curated mentors and limited access for quality
3. **In-Person Incentives**: Lower prices and better ratings for offline meetings
4. **Venue Partnerships**: Integration with physical spaces for community building
5. **Social Hangouts**: Casual events beyond structured mentoring sessions
6. **Premium Feel**: Beautiful UI with exclusive member badges and verification
7. **Mentor Visibility**: Enhanced mentor dashboard to track mentee progress and provide feedback

## Development

The app uses mock data for development. In a production environment, you would:

- Connect to a backend API
- Implement authentication
- Add real payment processing
- Connect to venue booking systems
- Implement real-time features for community events
- **Habit System Backend**: 
  - Database tables for goals, habits, habit_completions, reflections, badges
  - API endpoints for CRUD operations
  - Cron jobs for weekly reflection reminders
  - AI integration for reflection summarization and insights
  - Badge earning logic and automation

## License

GPL-3.0
