import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './components/ui/Toast'
import RequireAuth from './components/layout/RequireAuth'
import ScrollToTop from './components/layout/ScrollToTop'
import LocalModeBanner from './components/layout/LocalModeBanner'
import NotFound from './pages/NotFound'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
const BrowseMentors = lazy(() => import('./pages/BrowseMentors'))
const MentorProfile = lazy(() => import('./pages/MentorProfile'))
const Community = lazy(() => import('./pages/Community'))
const Events = lazy(() => import('./pages/Events'))
const Venues = lazy(() => import('./pages/Venues'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MenteeHome = lazy(() => import('./pages/MenteeHome'))
const BookSession = lazy(() => import('./pages/BookSession'))
const Goals = lazy(() => import('./pages/Goals'))
const Habits = lazy(() => import('./pages/Habits'))
const Reflections = lazy(() => import('./pages/Reflections'))
const BecomeMentor = lazy(() => import('./pages/BecomeMentor'))
const SetupProfile = lazy(() => import('./pages/SetupProfile'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Partners = lazy(() => import('./pages/Partners'))
const Careers = lazy(() => import('./pages/Careers'))
const Guidelines = lazy(() => import('./pages/Guidelines'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Help = lazy(() => import('./pages/Help'))
import Auth from './pages/Auth'

function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" aria-label="Loading page"></div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
    <AppProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <LocalModeBanner />
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mentors" element={<BrowseMentors />} />
              <Route path="/mentors/:id" element={<MentorProfile />} />
              <Route path="/community" element={<Community />} />
              <Route path="/events" element={<Events />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/mentee-home" element={<RequireAuth><MenteeHome /></RequireAuth>} />
              <Route path="/book/:mentorId" element={<RequireAuth><BookSession /></RequireAuth>} />
              <Route path="/goals" element={<RequireAuth><Goals /></RequireAuth>} />
              <Route path="/habits" element={<RequireAuth><Habits /></RequireAuth>} />
              <Route path="/journeys" element={<Reflections />} />
              <Route path="/become-mentor" element={<BecomeMentor />} />
              <Route path="/setup" element={<RequireAuth><SetupProfile /></RequireAuth>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/help" element={<Help />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
    </ToastProvider>
  )
}

export default App


