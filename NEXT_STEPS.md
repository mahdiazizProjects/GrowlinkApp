# Next Steps - Growlink App Backend Migration

## ✅ Completed
- [x] Created API service layer (`src/services/api.ts`)
- [x] Updated AppContext to use API calls instead of mock data
- [x] Updated components (BrowseMentors, BookSession, MenteeHome, Dashboard)
- [x] Fixed all TypeScript compilation errors
- [x] Made all mutations async and persist to database

## 🎯 Immediate Next Steps

### 1. Update Schema to Match New Design (HIGH PRIORITY)

The current schema in `amplify/data/resource.ts` still uses the old design. You need to update it to match the new schema from your design document:

**Current Schema Issues:**
- No Mentor/Mentee subtype models
- No Venue model
- No Event model
- No Feedback model (separate from Review)
- No HabitCompletion model
- No Notification model
- Session model missing fields (startTime, endTime, locationType, venueId)
- Goal model missing status field

**Action Items:**
1. Update `amplify/data/resource.ts` with the new schema design:
   - Add `Mentor` model (subtype with userId as PK)
   - Add `Mentee` model (subtype with userId as PK)
   - Add `Venue` model
   - Add `Event` model
   - Add `EventAttendance` model (many-to-many)
   - Add `Feedback` model (for session feedback)
   - Add `HabitCompletion` model
   - Add `Notification` model
   - Update `Session` model with new fields
   - Update `Goal` model to add status field
   - Update `Habit` model (currently using Todo as placeholder)

2. Reference the schema you provided earlier:
   ```
   - User (no role field - determined by Mentor/Mentee existence)
   - Mentor (userId PK, skills, expertiseLevels, availability, rating, sessionPricing)
   - Mentee (userId PK, goals, habits, reflections relationships)
   - Session (startTime, endTime, locationType, venueId, feedback relationship)
   - Goal (title, identityStatement, status: ACTIVE/COMPLETED)
   - Habit (description, frequency, completions relationship)
   - HabitCompletion (date, completedAt, notes)
   - Reflection (text, moodRating, weekOf)
   - Feedback (sessionId, submittedById, rating, comments)
   - Venue (name, address, latitude, longitude, capacity, partnerType)
   - Event (title, description, startTime, endTime, venueId, capacity)
   - EventAttendance (eventId, userId)
   - Notification (recipientId, message, scheduledDate, sentDate, readDate)
   ```

### 2. Deploy Backend Schema

Once the schema is updated:

```bash
# Deploy the updated schema
npx ampx sandbox

# This will:
# - Generate new GraphQL schema
# - Create/update DynamoDB tables
# - Update amplify_outputs.json
# - Generate TypeScript types
```

**Important:** After deployment, you'll need to:
- Update `src/services/api.ts` to use the new models
- Update type mappings to match new schema structure
- Test that data persists correctly

### 3. Update API Service Layer

After schema deployment, update `src/services/api.ts`:

- [ ] Add API functions for new models (Venue, Event, Feedback, etc.)
- [ ] Update Habit API to use actual Habit model (not Todo)
- [ ] Add HabitCompletion API functions
- [ ] Add Notification API functions
- [ ] Update Session API to handle new fields (startTime, endTime, locationType)
- [ ] Add Feedback API functions
- [ ] Update Goal API to handle status field

### 4. Complete Component Updates

- [ ] Update `Reflections.tsx` to fetch users from API instead of mock data
- [ ] Update `MentorProfile.tsx` to fetch mentor from API
- [ ] Update any other components still using mock data
- [ ] Add loading states to all components
- [ ] Add error handling UI (error messages, retry buttons)

### 5. Authentication Integration

- [ ] Complete OIDC authentication setup (already partially done)
- [ ] Create User record in database on first login
- [ ] Sync authenticated user with User model
- [ ] Handle user profile creation/update flow
- [ ] Implement proper sign-out that clears database state

### 6. Testing & Validation

**Manual Testing Checklist:**
- [ ] Create a session → Verify it appears in database
- [ ] Create a goal → Verify it persists
- [ ] Create a habit → Verify it persists
- [ ] Create a reflection → Verify it persists
- [ ] Update sessions/goals/habits → Verify changes persist
- [ ] Load mentors list → Verify data loads from API
- [ ] Load user-specific data on login → Verify correct data loads
- [ ] Test error handling when API calls fail
- [ ] Test loading states appear correctly

**Database Verification:**
- [ ] Check DynamoDB console to verify tables are created
- [ ] Verify data is actually stored (not just in memory)
- [ ] Test data persistence across page refreshes
- [ ] Test data isolation (users can only see their own data)

### 7. Error Handling & UX Improvements

- [ ] Add user-friendly error messages
- [ ] Add retry logic for failed API calls
- [ ] Add loading spinners/skeletons
- [ ] Add success notifications for mutations
- [ ] Handle network offline scenarios
- [ ] Add form validation before API calls

### 8. Real-time Updates (Optional - Future Enhancement)

- [ ] Consider adding GraphQL subscriptions for real-time updates
- [ ] Add polling for critical data (notifications, sessions)
- [ ] Implement optimistic updates for better UX

## 📋 Schema Migration Checklist

When updating the schema, ensure:

- [ ] All relationships are properly defined (`hasOne`, `hasMany`, `belongsTo`)
- [ ] Authorization rules are set correctly (`allow.publicApiKey()`, `allow.owner()`)
- [ ] Enums match between schema and TypeScript types
- [ ] Required fields are marked with `.required()`
- [ ] Optional fields are nullable
- [ ] Date/datetime fields use correct types (`a.date()` vs `a.datetime()`)

## 🚨 Important Notes

1. **Data Migration**: If you have existing data in the old schema, you'll need to migrate it to the new schema structure.

2. **Breaking Changes**: Updating the schema will break existing API calls. You'll need to update all API functions after schema changes.

3. **Type Generation**: After deploying schema, Amplify will generate new TypeScript types. You may need to update your type imports.

4. **Testing Environment**: Consider using a separate sandbox environment for testing schema changes before deploying to production.

## 📚 Resources

- [Amplify Gen 2 Data Documentation](https://docs.amplify.aws/react/build-a-backend/data/)
- [Amplify Schema Reference](https://docs.amplify.aws/react/build-a-backend/data/define-data/)
- Your `API_AND_DATABASE_DESIGN.md` for schema reference

## 🎯 Recommended Order

1. **First**: Update schema (`amplify/data/resource.ts`) ← **START HERE**
2. **Second**: Deploy schema (`npx ampx sandbox`)
3. **Third**: Update API service layer
4. **Fourth**: Test data persistence
5. **Fifth**: Complete component updates
6. **Sixth**: Add error handling & UX improvements

---

**Current Status**: ✅ API migration complete, TypeScript errors fixed
**Next Action**: Update `amplify/data/resource.ts` with new schema design





