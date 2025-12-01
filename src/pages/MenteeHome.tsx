import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { mockMentors } from '../data/mockData'
import ProfileCard from '../components/mentee/ProfileCard'
import GoalsList from '../components/mentee/GoalsList'
import DailyReflectionBanner from '../components/mentee/DailyReflectionBanner'
import FeedFilters from '../components/mentee/FeedFilters'
import MentorCard from '../components/mentee/MentorCard'
import TodosPanel from '../components/mentee/TodosPanel'
import NotificationMenu from '../components/mentee/NotificationMenu'

export default function MenteeHome() {
  const { currentUser } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Recommendation logic: tag matching + category filtering + search
  const recommendedMentors = useMemo(() => {
    if (!currentUser) return []

    let filtered = mockMentors.filter(mentor => mentor.role === 'MENTOR' || mentor.role === 'mentor')

    // Category filtering
    if (selectedCategory !== 'All') {
      const categoryMap: Record<string, string[]> = {
        'Career': ['Career Growth', 'Leadership', 'Startups', 'Product Strategy'],
        'Skills': ['Product Design', 'UX Research', 'Data Science', 'Machine Learning', 'Python', 'Engineering Leadership'],
        'Well-being': ['Leadership', 'Career Growth']
      }
      const categoryKeywords = categoryMap[selectedCategory] || []
      filtered = filtered.filter(mentor =>
        mentor.skills?.some(skill =>
          categoryKeywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
        )
      )
    }

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(query) ||
        mentor.title?.toLowerCase().includes(query) ||
        mentor.bio?.toLowerCase().includes(query) ||
        mentor.skills?.some(skill => skill.toLowerCase().includes(query))
      )
    }

    // Tag matching scoring (simple version)
    const userInterests = currentUser.interests || []
    const scoredMentors = filtered.map(mentor => {
      let score = 0
      const mentorTags = [...(mentor.skills || []), ...(mentor.interests || [])].map(t => t.toLowerCase())
      
      // Tag matching: +30 points per match
      userInterests.forEach(interest => {
        if (mentorTags.some(tag => tag.includes(interest.toLowerCase()) || interest.toLowerCase().includes(tag))) {
          score += 30
        }
      })

      // Rating: +20 points per star (max 100)
      score += (mentor.rating || 0) * 20

      // Total sessions: +1 point per 10 sessions (max 20)
      score += Math.min((mentor.totalSessions || 0) / 10, 20)

      return { mentor, score }
    })

    // Sort by score and return top mentors
    return scoredMentors
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.mentor)
  }, [currentUser, selectedCategory, searchQuery])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view your home page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner - Daily Reflection */}
      <div className="w-full bg-white border-b border-gray-200 px-4 py-6">
        <DailyReflectionBanner userId={currentUser.id} />
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Panel - Profile & Goals */}
          <aside className="md:col-span-12 lg:col-span-3 space-y-6 order-1 md:order-1">
            <ProfileCard user={currentUser} />
            <GoalsList userId={currentUser.id} />
          </aside>

          {/* Center Feed - Explore */}
          <main className="md:col-span-12 lg:col-span-6 space-y-6 order-3 md:order-2">
            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <FeedFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Recommended Mentors Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Mentors</h2>
              {recommendedMentors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No mentors found matching your criteria</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedMentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
              )}
            </div>

            {/* Feed Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Feed</h2>
              <p className="text-gray-500 text-center py-8">Feed content coming soon...</p>
            </div>
          </main>

          {/* Right Panel - Todos */}
          <aside className="md:col-span-12 lg:col-span-3 order-2 md:order-3">
            <TodosPanel userId={currentUser.id} />
          </aside>
        </div>
      </div>

      {/* Top Right Icons - Notifications */}
      <div className="fixed top-4 right-4 z-50 hidden md:block">
        <NotificationMenu userId={currentUser.id} />
      </div>
      
      {/* Mobile Notifications - Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
        <NotificationMenu userId={currentUser.id} />
      </div>
    </div>
  )
}

