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

- **React 18** + TypeScript, built with **Vite**
- **Tailwind CSS**, **React Router**, **Lucide** icons, **date-fns**
- **AWS Amplify Gen 2**: Cognito for accounts, AppSync + DynamoDB for data (`amplify/`)
- **Vitest** for unit tests

## Getting Started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev          # http://localhost:5173
```

### Two ways to run

**Local demo mode (no AWS needed).** If there is no `amplify_outputs.json` in the project root, the app
runs entirely in your browser: accounts and data live in `localStorage`, and a yellow banner says so.
It starts with a few demo mentors, venues and events so there is something to click. Create any account
on the sign-in page (pick *Mentor* or *Mentee*) and everything works: booking, approvals, goals, habits,
feedback, notifications. Open a private window, or clear site data, to start fresh. Demo accounts are for
development only and are not secure.

**Cloud mode (real backend).** Put `amplify_outputs.json` in the project root and restart. Sign-up then
goes through Cognito (with email verification and password reset) and data is stored in DynamoDB. See
[SETUP.md](./SETUP.md) for how to get that file. You can force local mode with `VITE_FORCE_LOCAL=true`.

> **After pulling these changes, redeploy the backend** (`npx ampx sandbox` or a new Amplify Console
> build). The schema gained new tables (Habit, HabitCompletion, SessionFeedback, MentorSessionNote,
> Notification, Venue, Event, SavedMentor, MentorshipRequest, MentorApplication, ContactMessage) and new
> fields on Session and Goal. Until you redeploy, cloud mode will show errors for those features.
> Venues and events start empty in cloud mode; add rows to the `Venue` and `Event` tables to list them.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (slot availability, streaks and badges, local data store) |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | TypeScript only |

## How the main flows work

- **Booking:** mentees pick a time inside the mentor's weekly availability (mentors set it under
  *My availability*). Slots that overlap another pending or confirmed booking are never offered, and the
  slot is re-checked right before saving. The mentor is notified, approves or declines, and the mentee is
  notified. Requests whose time passes without approval expire automatically.
- **After a session:** the mentor marks it complete, the mentee leaves feedback, and the mentor's rating
  (shown on browse cards and their profile) is the average of real feedback. Nothing is invented: mentors
  without feedback show as "New mentor".
- **Goals and habits:** a goal starts as a draft and becomes active once it has an action plan. Each
  habit is stored with its cue and reward; check-ins drive streaks, points and badges.
- **Mentorship requests:** mentees can request a mentor from their home page; mentors accept or decline
  from their dashboard.
- **Become a mentor:** submits an application for review. It does not change the account's role; an
  admin sets `role` to `MENTOR` on approval.

## Project Structure

```
amplify/              Amplify Gen 2 backend (auth + data schema)
src/
  components/         UI, grouped by area (events, feedback, habits, journeys, layout, mentee, mentor, ui)
  context/            AppContext: signed-in user and their data, with all mutations
  data/demoData.ts    Seed data for local demo mode only
  pages/              One component per route (loaded on demand)
  services/
    api.ts            Every read and write; paginates list queries
    auth.ts           Sign-in/up/reset (Cognito in cloud mode, browser storage locally)
    backend.ts        Detects cloud vs local mode
    localStore.ts     Browser-storage stand-in for the Amplify data client
  types/              Shared TypeScript types
  utils/              Pure logic (availability, badges, session time) with tests
```

## Before launch

See [NEXT_STEPS.md](./NEXT_STEPS.md). The most important item is tightening data access rules: right now
every table is readable and writable with the public API key.

## License

GPL-3.0
