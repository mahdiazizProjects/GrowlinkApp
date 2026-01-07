import * as api from '../services/api'
import { mockMentors, mockMentees } from '../data/mockData'
import type { User } from '../types'

/**
 * Seeds the database with mock mentor data
 * This function checks if mentors already exist and only seeds if the database is empty
 */
export async function seedMentors(): Promise<{ created: number; skipped: number }> {
  try {
    // Check if mentors already exist
    const existingMentors = await api.listMentors()
    
    if (existingMentors.length > 0) {
      console.log(`Found ${existingMentors.length} existing mentors. Skipping seed.`)
      return { created: 0, skipped: existingMentors.length }
    }

    console.log('No mentors found. Seeding database with mock mentors...')
    
    let created = 0
    let skipped = 0

    // Create each mentor from mock data
    for (const mockMentor of mockMentors) {
      try {
        // Check if user with this email already exists
        const allUsers = await api.listUsers()
        const existingUser = allUsers.find(u => u.email === mockMentor.email)
        
        if (existingUser) {
          console.log(`User ${mockMentor.email} already exists. Skipping.`)
          skipped++
          continue
        }

        // Map mock mentor to database schema
        const userInput: Partial<User> = {
          username: mockMentor.username,
          email: mockMentor.email,
          name: mockMentor.name,
          role: 'MENTOR', // Database schema uses uppercase
          bio: mockMentor.bio,
          avatar: mockMentor.avatar,
          location: mockMentor.location,
          skills: mockMentor.skills || [],
          interests: [],
        }

        const createdUser = await api.createUser(userInput)
        
        if (createdUser) {
          console.log(`✓ Created mentor: ${mockMentor.name} (${mockMentor.email})`)
          created++
        } else {
          console.warn(`Failed to create mentor: ${mockMentor.name}`)
          skipped++
        }
      } catch (error) {
        console.error(`Error creating mentor ${mockMentor.name}:`, error)
        skipped++
      }
    }

    console.log(`Seed complete. Created: ${created}, Skipped: ${skipped}`)
    return { created, skipped }
  } catch (error) {
    console.error('Error seeding mentors:', error)
    return { created: 0, skipped: 0 }
  }
}

/**
 * Seeds mentees as well (optional)
 */
export async function seedMentees(): Promise<{ created: number; skipped: number }> {
  try {
    // Check if mentees already exist
    const allUsers = await api.listUsers()
    const existingMentees = allUsers.filter(u => u.role === 'MENTEE' || u.role === 'mentee')
    
    if (existingMentees.length > 0) {
      console.log(`Found ${existingMentees.length} existing mentees. Skipping seed.`)
      return { created: 0, skipped: existingMentees.length }
    }

    console.log('No mentees found. Seeding database with mock mentees...')
    
    let created = 0
    let skipped = 0

    for (const mockMentee of mockMentees) {
      try {
        const existingUser = allUsers.find(u => u.email === mockMentee.email)
        
        if (existingUser) {
          console.log(`User ${mockMentee.email} already exists. Skipping.`)
          skipped++
          continue
        }

        const userInput: Partial<User> = {
          username: mockMentee.username,
          email: mockMentee.email,
          name: mockMentee.name,
          role: 'MENTEE',
          bio: mockMentee.bio,
          avatar: mockMentee.avatar,
          location: mockMentee.location,
          skills: mockMentee.skills || [],
          interests: [],
        }

        const createdUser = await api.createUser(userInput)
        
        if (createdUser) {
          console.log(`✓ Created mentee: ${mockMentee.name} (${mockMentee.email})`)
          created++
        } else {
          console.warn(`Failed to create mentee: ${mockMentee.name}`)
          skipped++
        }
      } catch (error) {
        console.error(`Error creating mentee ${mockMentee.name}:`, error)
        skipped++
      }
    }

    console.log(`Mentee seed complete. Created: ${created}, Skipped: ${skipped}`)
    return { created, skipped }
  } catch (error) {
    console.error('Error seeding mentees:', error)
    return { created: 0, skipped: 0 }
  }
}

