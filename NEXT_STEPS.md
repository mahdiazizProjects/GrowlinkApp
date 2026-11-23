# Status and next steps

## Done

- Every feature reads and writes the backend; no mock data remains outside local demo mode.
- Schema covers all features: Habit, HabitCompletion, SessionFeedback, MentorSessionNote, Notification,
  Venue, Event, SavedMentor, MentorshipRequest, MentorApplication, ContactMessage, plus session type,
  venue, topic, cancellation and feedback fields, and goal status, identity and mentor.
- List queries follow pagination (DynamoDB filters after reading a page, so single-page queries silently
  missed records once tables grew).
- Notifications are stored and delivered to the other person for bookings, approvals, cancellations,
  completions, feedback and mentorship requests. Every signed-in user has a bell.
- Ratings, community stats and badges are computed from real data.
- Sign-in returns you to the page you were on; password reset and resending verification codes work;
  unverified accounts resume verification instead of failing.
- Protected pages redirect to sign-in; unknown URLs show a 404 page.
- Mobile navigation menu; pages load on demand (initial JavaScript cut from 1.1 MB to about 130 KB plus
  cached React and AWS chunks).
- ESLint configured (the lint script previously had no config and never ran); unit tests added.
- Fixed: crash on the mentee dashboard (hooks called after an early return), reflections and streaks
  using the UTC date (wrong in the evening in North America), session dialogs showing stale status after
  approval, the action plan editor wiping unsaved edits, double-booking of a mentor's slot, fake meeting
  links, mentor applications silently promoting accounts to mentor, forms that reported success without
  saving, and a backend API key that expired after 30 days (now 365).

- Data access locked down (see README, *Access rules and admins*). Signed-in requests use Cognito and
  per-user rules; the public API key can only read catalogue data and submit two forms. User emails are
  visible only to their owner and admins. The rules are compiled locally with `npm run check:backend`.
- Admin page (/admin) for mentor applications, contact messages, venues and events; `ADMIN` Cognito group.
- Mentors add a video-call link to virtual sessions (http/https only); the mentee is notified.
- Session dialogs now show venue details (they were never displayed) and no longer crash when a profile
  can't be loaded.
- Existing upcoming sessions and past feedback are backfilled into the new public slot and rating tables
  the first time a participant signs in after the upgrade.

## Deploying this version

1. Deploy the backend (`npx ampx sandbox` for a test environment first, then your Amplify Console build).
2. Add yourself to the `ADMIN` group in Cognito, then sign out and back in.
3. Smoke-test with two accounts (one mentor, one mentee) in two browsers:
   - signed out: home, mentors, a mentor profile, events and venues load; contact form sends
   - mentee: book a session; the slot disappears for a second mentee; mentor gets the notification
   - mentor: approve, add a call link, mark complete; mentee leaves feedback; rating shows publicly
   - admin: approve a mentor application; add a venue and an event; join it as a mentee
   - try opening another user's goal or session id directly: it must not load
4. Watch the browser console for "Not Authorized" errors; each one names the table and operation.

## Known limits

1. **Private journey posts** are hidden in the app but any signed-in user could still fetch them from the
   API. Fixing that needs either a separate table for private posts or a small server-side function.
2. **Ratings and notifications can be created by any signed-in user.** That is what lets a mentee publish
   a rating or notify their mentor, but it also allows spam. A server-side function that checks the
   session exists would close it.
3. **Action items and progress reports created before this version** have no owner recorded, so after
   deploying they can be read but not edited by their creator. Deleting and re-creating the habit plan
   fixes it for that user (an admin can also edit them).
4. **Payments** are not implemented: prices are shown but not charged; membership upgrades go to the
   contact form.
5. **Notifications are in-app only** (no email or push reminders).
6. **Meeting links are pasted by the mentor**; there is no Meet/Zoom integration.
