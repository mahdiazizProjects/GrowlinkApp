# GrowLink - Exclusive Mentorship & Community Platform

A premium mentorship platform that connects curated mentors and mentees through meaningful in-person and virtual experiences. Unlike traditional mentorship platforms, GrowLink emphasizes:

- **Exclusive & Curated**: Limited membership with hand-picked, verified mentors
- **In-Person First**: Partner with libraries, co-working spaces, and community venues
- **Community Hangouts**: Beyond sessions - casual meetups, workshops, and networking events
- **Better Rates**: In-person meetings cost less and earn bonus rating points
- **Premium Experience**: Quality over quantity with a focus on real connections

## Features

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
│   └── layout/      # Navbar, Footer, etc.
├── context/         # React Context for state management
├── data/            # Mock data for development
├── pages/           # Page components
├── types/           # TypeScript type definitions
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Available Pages

- `/` - Home page with featured mentors and features
- `/mentors` - Browse all mentors with search and filters
- `/mentors/:id` - Individual mentor profile
- `/book/:mentorId` - Book a session (virtual or in-person)
- `/community` - Community hub with stats and events
- `/events` - View all upcoming events and hangouts
- `/venues` - Browse partner venues
- `/dashboard` - User dashboard (requires login)

## Key Differentiators

1. **Exclusive Membership**: Curated mentors and limited access for quality
2. **In-Person Incentives**: Lower prices and better ratings for offline meetings
3. **Venue Partnerships**: Integration with physical spaces for community building
4. **Social Hangouts**: Casual events beyond structured mentoring sessions
5. **Premium Feel**: Beautiful UI with exclusive member badges and verification

## Development

The app uses mock data for development. In a production environment, you would:

- Connect to a backend API
- Implement authentication
- Add real payment processing
- Connect to venue booking systems
- Implement real-time features for community events

## License

GPL-3.0
