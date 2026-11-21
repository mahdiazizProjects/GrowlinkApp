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

## Before launch

1. **Lock down data access (security).** Every model uses `allow.publicApiKey()` and the default mode is
   `apiKey`, so anyone with the site's API key (it is in the page source) can read every user's private
   reflections, mentor notes and contact messages, and edit records that are not theirs. Move to
   `allow.owner()` / authenticated rules per model, keep public read only where intended (User profiles,
   Venue, Event), and pass `authMode: 'userPool'` for signed-in calls. Test against a sandbox.
2. **Admin review of mentor applications.** Applications are stored in `MentorApplication`; approving one
   currently means setting the user's `role` by hand. A small admin page or a Cognito group would help.
3. **Meeting links for virtual sessions.** Nothing generates one yet; the mentor can add a link in the
   session notes. Integrating Google Meet, Zoom or similar would close this.
4. **Payments.** Session prices are displayed but not charged, and membership upgrades go to the contact
   form.
5. **Email or push reminders.** Notifications are in-app only.
6. **Seed venues and events** in the cloud tables, or add a simple admin form for them.
