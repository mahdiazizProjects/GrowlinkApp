# How to Sign In as a Mentor

## Quick Steps

1. **Navigate to Dashboard**
   - Go to `http://localhost:5173/dashboard`
   - Or click "Sign In" in the navigation bar

2. **Choose Your Role**
   - You'll see two login options:
     - **Sign In as Mentee (Demo)** - For mentee dashboard
     - **Sign In as Mentor (Demo)** - For mentor dashboard ⭐

3. **Click "Sign In as Mentor (Demo)"**
   - This will log you in as **Sarah Chen**, a mentor account

4. **Explore the Mentor Dashboard**
   - You'll see three tabs:
     - **Dashboard** - Overview with summary cards, today's sessions, upcoming sessions, and recent feedback
     - **My Mentees** - List of all mentees with their stats
     - **Analytics** - Performance metrics, rating trends, strengths, and improvement areas

## What You Can Do as a Mentor

### Dashboard Tab
- View summary cards (Total Mentees, Upcoming Sessions, Average Rating, Recent Feedback)
- See today's sessions
- View upcoming sessions
- Read recent mentee feedback
- Click on any session to view details and add reflection notes

### Session Details
- Click any session card to open the session detail modal
- View mentee feedback (if submitted)
- Add session reflection notes:
  - Session Summary (required)
  - Follow-up Action Items
  - Growth Focus for Mentee (optional)
  - Private Notes (optional)

### My Mentees Tab
- View all mentees you're working with
- See stats: Total Sessions, Completed Sessions, Average Rating, Upcoming Sessions
- View last session date
- Click "View Profile" to see mentee details (ready for implementation)

### Analytics Tab
- View key metrics: Average Rating, Total Sessions, Sessions/Week, Feedback Rate
- See rating trend chart over time
- View top strengths (extracted from positive feedback)
- See areas for improvement (extracted from improvement suggestions)

### Notifications
- Check the bell icon in the navbar (top right)
- Get notified when:
  - A new session is booked
  - New feedback is received
- Click notifications to navigate to related sessions

## Switching Between Roles

To switch from mentee to mentor (or vice versa):

1. **Option 1: Logout and Login Again**
   - The logout functionality can be added to the user menu
   - Or simply refresh the page and log in with a different role

2. **Option 2: Direct URL**
   - Go to `/dashboard` and you'll see the login screen again if not logged in

## Demo Mentor Account Details

- **Name:** Sarah Chen
- **Email:** sarah@example.com
- **Role:** mentor
- **Location:** San Francisco, CA
- **Skills:** Product Design, UX/UI, Design Systems, Mentorship
- **Membership:** Exclusive

## Testing the Mentor Features

1. **View Sessions:**
   - Sessions will appear if there are any in the system
   - Click on a session to view details and add notes

2. **Add Reflection Notes:**
   - Open a session detail modal
   - Fill in the reflection form
   - Save your notes

3. **View Analytics:**
   - Go to the Analytics tab
   - See your performance metrics
   - View rating trends and feedback insights

4. **Check Notifications:**
   - Notifications appear when:
     - A mentee books a session with you
     - A mentee submits feedback after a session

## Notes

- This is a demo system with mock data
- In production, mentors would need to:
  - Apply through `/become-mentor` page
  - Get approved by admin
  - Complete onboarding
- The mentor dashboard automatically shows when `role: 'mentor'` is set in the user object

