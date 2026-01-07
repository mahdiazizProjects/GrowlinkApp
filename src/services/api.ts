import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { 
  User, Session, Goal, Habit, Reflection, Event, Venue
} from '../types';

// Lazy-load client to ensure Amplify is configured first
let client: ReturnType<typeof generateClient<Schema>> | null = null;

function getClient() {
  if (!client) {
    client = generateClient<Schema>();
  }
  return client;
}

// ==================== USER API ====================

export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data } = await getClient().models.User.get({ id: userId });
    if (!data) return null;
    return mapUserFromAPI(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function listUsers(filter?: any): Promise<User[]> {
  try {
    const { data } = await getClient().models.User.list(filter);
    return (data || []).map(mapUserFromAPI);
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
}

export async function createUser(input: Partial<User>): Promise<User | null> {
  try {
    const { data } = await getClient().models.User.create({
      email: input.email || '',
      name: input.name || '',
      username: input.username || input.email?.split('@')[0] || '',
      bio: input.bio,
      avatar: input.avatar,
      location: input.location,
      skills: input.skills || [],
      interests: input.interests || [],
      role: (input.role?.toUpperCase() === 'MENTOR' ? 'MENTOR' : 
             input.role?.toUpperCase() === 'MENTEE' ? 'MENTEE' : 
             input.role?.toUpperCase() === 'BOTH' ? 'BOTH' : 'MENTEE'),
    });
    if (!data) return null;
    return mapUserFromAPI(data);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    // Normalize role to match schema enum
    const normalizedUpdates: any = { ...updates };
    if (normalizedUpdates.role) {
      if (normalizedUpdates.role === 'mentor') normalizedUpdates.role = 'MENTOR';
      else if (normalizedUpdates.role === 'mentee') normalizedUpdates.role = 'MENTEE';
      else if (normalizedUpdates.role === 'BOTH') normalizedUpdates.role = 'BOTH';
    }
    
    const { data } = await getClient().models.User.update({
      id: userId,
      ...normalizedUpdates,
    });
    if (!data) return null;
    return mapUserFromAPI(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// ==================== SESSION API ====================

export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const { data } = await getClient().models.Session.get({ id: sessionId });
    if (!data) return null;
    return mapSessionFromAPI(data);
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export async function listSessions(filter?: any): Promise<Session[]> {
  try {
    const { data } = await getClient().models.Session.list(filter);
    const sessions = (data || []).map(mapSessionFromAPI);
    
    // Populate mentor and mentee user objects
    const sessionsWithUsers = await Promise.all(
      sessions.map(async (session) => {
        const [mentor, mentee] = await Promise.all([
          getUser(session.mentorId),
          getUser(session.menteeId)
        ]);
        return {
          ...session,
          mentor: mentor || undefined,
          mentee: mentee || undefined,
        };
      })
    );
    
    return sessionsWithUsers;
  } catch (error) {
    console.error('Error listing sessions:', error);
    return [];
  }
}

export async function listSessionsForUser(userId: string, role: 'mentor' | 'mentee'): Promise<Session[]> {
  try {
    const filter = role === 'mentor' 
      ? { filter: { mentorId: { eq: userId } } }
      : { filter: { menteeId: { eq: userId } } };
    const { data } = await getClient().models.Session.list(filter);
    const sessions = (data || []).map(mapSessionFromAPI);
    
    // Populate mentor and mentee user objects
    const sessionsWithUsers = await Promise.all(
      sessions.map(async (session) => {
        const [mentor, mentee] = await Promise.all([
          getUser(session.mentorId),
          getUser(session.menteeId)
        ]);
        return {
          ...session,
          mentor: mentor || undefined,
          mentee: mentee || undefined,
        };
      })
    );
    
    return sessionsWithUsers;
  } catch (error) {
    console.error('Error listing sessions for user:', error);
    return [];
  }
}

export async function createSession(input: Partial<Session>): Promise<Session | null> {
  try {
    // Normalize status to uppercase
    let status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' = 'PENDING';
    if (input.status) {
      const statusUpper = input.status.toUpperCase();
      if (statusUpper === 'PENDING' || statusUpper === 'CONFIRMED' || statusUpper === 'COMPLETED' || statusUpper === 'CANCELLED') {
        status = statusUpper as typeof status;
      }
    }
    
    const { data } = await getClient().models.Session.create({
      mentorId: input.mentorId || '',
      menteeId: input.menteeId || '',
      date: input.date || new Date().toISOString(),
      duration: input.duration || 60,
      status,
      notes: input.notes,
      meetingLink: input.meetingLink,
    });
    if (!data) return null;
    
    const session = mapSessionFromAPI(data);
    
    // Populate mentor and mentee user objects
    const [mentor, mentee] = await Promise.all([
      getUser(session.mentorId),
      getUser(session.menteeId)
    ]);
    
    return {
      ...session,
      mentor: mentor || undefined,
      mentee: mentee || undefined,
    };
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
  try {
    // Normalize status to uppercase if provided
    const normalizedUpdates: any = { ...updates };
    if (normalizedUpdates.status) {
      const statusUpper = normalizedUpdates.status.toUpperCase();
      if (statusUpper === 'PENDING' || statusUpper === 'CONFIRMED' || statusUpper === 'COMPLETED' || statusUpper === 'CANCELLED') {
        normalizedUpdates.status = statusUpper;
      } else {
        delete normalizedUpdates.status;
      }
    }
    
    const { data } = await getClient().models.Session.update({
      id: sessionId,
      ...normalizedUpdates,
    });
    if (!data) return null;
    return mapSessionFromAPI(data);
  } catch (error) {
    console.error('Error updating session:', error);
    return null;
  }
}

// ==================== GOAL API ====================

export async function getGoal(goalId: string): Promise<Goal | null> {
  try {
    const { data } = await getClient().models.Goal.get({ id: goalId });
    if (!data) return null;
    return mapGoalFromAPI(data);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return null;
  }
}

export async function listGoals(userId?: string): Promise<Goal[]> {
  try {
    const filter = userId ? { filter: { userId: { eq: userId } } } : undefined;
    const { data } = await getClient().models.Goal.list(filter);
    return (data || []).map(mapGoalFromAPI);
  } catch (error) {
    console.error('Error listing goals:', error);
    return [];
  }
}

export async function listMentors(): Promise<User[]> {
  try {
    // Note: Filtering by role may not be supported in current schema
    // For now, list all users and filter client-side
    const { data } = await getClient().models.User.list();
    const allUsers = (data || []).map(mapUserFromAPI);
    return allUsers.filter(user => 
      user.role === 'MENTOR' || user.role === 'mentor' || user.role === 'BOTH'
    );
  } catch (error) {
    console.error('Error listing mentors:', error);
    return [];
  }
}

export async function createGoal(input: Partial<Goal>): Promise<Goal | null> {
  try {
    // Note: Status field doesn't exist in current Goal schema
    const { data } = await getClient().models.Goal.create({
      userId: input.userId || '',
      title: input.title || '',
      description: input.description,
      category: input.category,
      progress: input.progress || 0,
      dueDate: input.dueDate,
      // status field removed - not in schema
    });
    if (!data) return null;
    return mapGoalFromAPI(data);
  } catch (error) {
    console.error('Error creating goal:', error);
    return null;
  }
}

export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
  try {
    const { data } = await getClient().models.Goal.update({
      id: goalId,
      ...updates,
    });
    if (!data) return null;
    return mapGoalFromAPI(data);
  } catch (error) {
    console.error('Error updating goal:', error);
    return null;
  }
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    // First, try to delete associated action plan if it exists
    // We'll need to find it by checking action plans
    const { errors } = await getClient().models.Goal.delete({ id: goalId });
    if (errors && errors.length > 0) {
      console.error('Error deleting goal:', errors);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
}

// ==================== HABIT API ====================

export async function listHabits(userId?: string, goalId?: string): Promise<Habit[]> {
  try {
    const filter: any = {};
    if (userId) filter.userId = { eq: userId };
    if (goalId) filter.goalId = { eq: goalId };
    const { data } = await getClient().models.Todo.list(Object.keys(filter).length > 0 ? filter : undefined);
    // Note: Habits are stored as Todos in current schema - this needs to be updated when schema changes
    return (data || []).map(mapHabitFromAPI);
  } catch (error) {
    console.error('Error listing habits:', error);
    return [];
  }
}

export async function createHabit(input: Partial<Habit> & { userId?: string }): Promise<Habit | null> {
  try {
    // Note: Using Todo model temporarily - needs schema update
    // Habit type doesn't have userId, but Todo model requires it
    const userId = input.userId || '';
    if (!userId) {
      console.error('Error creating habit: userId is required');
      return null;
    }
    
    // Use title as text for Todo model (since Todo.text is required)
    const text = input.title || input.description || '';
    if (!text) {
      console.error('Error creating habit: title or description is required');
      return null;
    }
    
    const { data } = await getClient().models.Todo.create({
      userId,
      goalId: input.goalId,
      text,
      done: false,
    });
    if (!data) return null;
    return mapHabitFromAPI(data);
  } catch (error) {
    console.error('Error creating habit:', error);
    return null;
  }
}

// ==================== REFLECTION API ====================

export async function getReflection(reflectionId: string): Promise<Reflection | null> {
  try {
    const { data } = await getClient().models.Reflection.get({ id: reflectionId });
    if (!data) return null;
    return mapReflectionFromAPI(data);
  } catch (error) {
    console.error('Error fetching reflection:', error);
    return null;
  }
}

export async function listReflections(userId?: string): Promise<Reflection[]> {
  try {
    const filter = userId ? { filter: { userId: { eq: userId } } } : undefined;
    const { data } = await getClient().models.Reflection.list(filter);
    return (data || []).map(mapReflectionFromAPI);
  } catch (error) {
    console.error('Error listing reflections:', error);
    return [];
  }
}

export async function createReflection(input: Partial<Reflection>): Promise<Reflection | null> {
  try {
    // Handle content/text - ensure they're strings
    const textValue = typeof input.text === 'string' ? input.text : 
                     (typeof input.content === 'string' ? input.content : '');
    const contentValue = typeof input.content === 'string' ? input.content : textValue;
    
    const { data } = await getClient().models.Reflection.create({
      userId: input.userId || '',
      date: input.date || new Date().toISOString().split('T')[0],
      mood: input.mood,
      moodScore: input.moodScore,
      text: textValue,
      content: contentValue,
      isShared: input.isShared || false,
      sharedWithMentorId: input.sharedWithMentorId,
    });
    if (!data) return null;
    return mapReflectionFromAPI(data);
  } catch (error) {
    console.error('Error creating reflection:', error);
    return null;
  }
}

// ==================== EVENT API ====================

export async function listEvents(): Promise<Event[]> {
  try {
    // Note: Events not in current schema - will need to add
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error listing events:', error);
    return [];
  }
}

// ==================== ACTION PLAN API ====================

export async function createActionPlan(input: {
  creatorId: string;
  assigneeId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}): Promise<any> {
  try {
    const { data } = await getClient().models.ActionPlan.create({
      creatorId: input.creatorId,
      assigneeId: input.assigneeId,
      title: input.title,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status || 'ACTIVE',
    });
    return data;
  } catch (error) {
    console.error('Error creating action plan:', error);
    return null;
  }
}

export async function createActionItem(input: {
  planId: string;
  title: string;
  description?: string;
  type?: 'DO' | 'AVOID';
  frequency?: 'DAILY' | 'WEEKLY' | 'ONE_TIME';
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}): Promise<any> {
  try {
    const { data } = await getClient().models.ActionItem.create({
      planId: input.planId,
      title: input.title,
      description: input.description,
      type: input.type || 'DO',
      frequency: input.frequency || 'DAILY',
      status: input.status || 'ACTIVE',
    });
    return data;
  } catch (error) {
    console.error('Error creating action item:', error);
    return null;
  }
}

export async function listActionPlans(assigneeId?: string, creatorId?: string): Promise<any[]> {
  try {
    // Since users create plans for themselves, we can filter by assigneeId
    // If both are provided and different, we'd need OR logic, but for now we'll prioritize assigneeId
    const filter: any = {};
    if (assigneeId) {
      filter.assigneeId = { eq: assigneeId };
    } else if (creatorId) {
      filter.creatorId = { eq: creatorId };
    }
    
    const { data } = await getClient().models.ActionPlan.list(Object.keys(filter).length > 0 ? filter : undefined);
    return data || [];
  } catch (error) {
    console.error('Error listing action plans:', error);
    return [];
  }
}

export async function getActionPlan(planId: string): Promise<any | null> {
  try {
    const { data } = await getClient().models.ActionPlan.get({ id: planId });
    return data || null;
  } catch (error) {
    console.error('Error getting action plan:', error);
    return null;
  }
}

export async function updateActionPlan(planId: string, updates: {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}): Promise<any | null> {
  try {
    const { data } = await getClient().models.ActionPlan.update({
      id: planId,
      ...updates,
    });
    return data || null;
  } catch (error) {
    console.error('Error updating action plan:', error);
    return null;
  }
}

export async function listActionItems(planId: string): Promise<any[]> {
  try {
    const { data } = await getClient().models.ActionItem.list({
      filter: { planId: { eq: planId } },
    });
    return data || [];
  } catch (error) {
    console.error('Error listing action items:', error);
    return [];
  }
}

export async function updateActionItem(itemId: string, updates: {
  title?: string;
  description?: string;
  type?: 'DO' | 'AVOID';
  frequency?: 'DAILY' | 'WEEKLY' | 'ONE_TIME';
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}): Promise<any | null> {
  try {
    const { data } = await getClient().models.ActionItem.update({
      id: itemId,
      ...updates,
    });
    return data || null;
  } catch (error) {
    console.error('Error updating action item:', error);
    return null;
  }
}

export async function deleteActionItem(itemId: string): Promise<boolean> {
  try {
    const { errors } = await getClient().models.ActionItem.delete({ id: itemId });
    if (errors && errors.length > 0) {
      console.error('Error deleting action item:', errors);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting action item:', error);
    return false;
  }
}

export async function deleteActionPlan(planId: string): Promise<boolean> {
  try {
    console.log('deleteActionPlan: Starting deletion of plan', planId)
    
    // First, delete all action items in the plan
    const actionItems = await listActionItems(planId)
    console.log('deleteActionPlan: Found', actionItems.length, 'action items to delete')
    
    if (actionItems.length > 0) {
      // Delete items one by one to ensure we catch any errors
      for (const item of actionItems) {
        try {
          console.log('deleteActionPlan: Deleting action item', item.id)
          await deleteActionItem(item.id)
        } catch (itemError) {
          console.error('deleteActionPlan: Error deleting action item', item.id, itemError)
          // Continue with other items even if one fails
        }
      }
      console.log('deleteActionPlan: Finished deleting action items')
    }
    
    // Always try to delete the action plan itself, even if some items failed
    console.log('deleteActionPlan: Deleting action plan', planId)
    const { data, errors } = await getClient().models.ActionPlan.delete({ id: planId })
    if (errors && errors.length > 0) {
      console.error('deleteActionPlan: Errors deleting plan', errors)
      throw new Error(`Failed to delete action plan: ${errors.map(e => e.message).join(', ')}`)
    }
    console.log('deleteActionPlan: Successfully deleted action plan', planId, data)
    return true
  } catch (error) {
    console.error('Error deleting action plan:', error)
    // If plan deletion fails, try to delete remaining items
    try {
      const remainingItems = await listActionItems(planId)
      if (remainingItems.length > 0) {
        console.log('deleteActionPlan: Plan deletion failed, cleaning up remaining items')
        for (const item of remainingItems) {
          try {
            await deleteActionItem(item.id)
          } catch (itemError) {
            console.error('deleteActionPlan: Error cleaning up item', item.id, itemError)
          }
        }
      }
    } catch (cleanupError) {
      console.error('deleteActionPlan: Error during cleanup', cleanupError)
    }
    return false
  }
}

// ==================== VENUE API ====================

export async function listVenues(): Promise<Venue[]> {
  try {
    // Note: Venues not in current schema - will need to add
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error listing venues:', error);
    return [];
  }
}

// ==================== MAPPING FUNCTIONS ====================

function mapUserFromAPI(data: any): User {
  return {
    id: data.id,
    username: data.username || data.email?.split('@')[0] || '',
    email: data.email || '',
    name: data.name || '',
    role: (data.role?.toLowerCase() || 'mentee') as 'mentor' | 'mentee' | 'BOTH',
    bio: data.bio,
    avatar: data.avatar,
    location: data.location,
    skills: data.skills || [],
    interests: data.interests || [],
    membershipTier: 'standard',
    verified: false,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

function mapSessionFromAPI(data: any): Session {
  // Normalize status
  let status: Session['status'] = 'pending';
  if (data.status) {
    const statusLower = data.status.toLowerCase();
    if (statusLower === 'pending' || statusLower === 'confirmed' || statusLower === 'completed' || statusLower === 'cancelled') {
      status = statusLower as Session['status'];
    }
  }
  
  // Determine session type: if meetingLink exists, it's virtual, otherwise in-person
  const sessionType: 'virtual' | 'in-person' = data.meetingLink ? 'virtual' : 'in-person';
  
  return {
    id: data.id,
    mentorId: data.mentorId,
    menteeId: data.menteeId,
    type: sessionType,
    date: data.date,
    time: new Date(data.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: data.duration || 60,
    status,
    topic: data.notes || '',
    notes: data.notes,
    meetingLink: data.meetingLink,
    feedbackEligible: false,
    feedbackSubmitted: false,
  };
}

function mapGoalFromAPI(data: any): Goal {
  return {
    id: data.id,
    userId: data.userId,
    title: data.title || '',
    description: data.description,
    category: data.category,
    progress: data.progress || 0,
    dueDate: data.dueDate,
    status: (data.status?.toLowerCase() || 'draft') as Goal['status'],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

function mapHabitFromAPI(data: any): Habit {
  return {
    id: data.id,
    goalId: data.goalId || '',
    title: data.text || data.title || 'Untitled Habit',
    description: data.text || '',
    frequency: 'daily',
    duration: 2, // Default to 2 minutes for micro-habits
    cue: {
      time: undefined,
      place: undefined,
      context: undefined,
    },
    status: 'active',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

function mapReflectionFromAPI(data: any): Reflection {
  return {
    id: data.id,
    userId: data.userId,
    date: data.date,
    mood: (data.mood?.toUpperCase() || 'NEUTRAL') as Reflection['mood'],
    text: data.text || data.content || '',
    content: data.content || data.text || '',
    visibility: data.isShared ? 'everyone' : 'private',
    isShared: data.isShared || false,
    tags: [],
    reactions: [],
    comments: [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

