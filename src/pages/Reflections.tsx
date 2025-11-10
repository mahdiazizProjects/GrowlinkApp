import { useApp } from '../context/AppContext'
import ReflectionJournal from '../components/habits/ReflectionJournal'
import BadgeSystem from '../components/habits/BadgeSystem'

export default function Reflections() {
  const { currentUser, reflections, goals, badges, addReflection } = useApp()

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view reflections.</p>
        </div>
      </div>
    )
  }

  const handleSubmitReflection = (reflectionData: Omit<typeof reflections[0], 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReflection = {
      ...reflectionData,
      id: `reflection-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addReflection(newReflection)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reflections</h1>
          <p className="text-gray-600">Weekly reflection and growth insights</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReflectionJournal
              reflections={reflections}
              goals={goals}
              onSubmit={handleSubmitReflection}
              currentUserId={currentUser.id}
            />
          </div>
          <div>
            <BadgeSystem badges={badges} userId={currentUser.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

