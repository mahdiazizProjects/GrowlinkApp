import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import BrowseMentors from './pages/BrowseMentors'
import MentorProfile from './pages/MentorProfile'
import Community from './pages/Community'
import Events from './pages/Events'
import Venues from './pages/Venues'
import Dashboard from './pages/Dashboard'
import MenteeHome from './pages/MenteeHome'
import BookSession from './pages/BookSession'
import Goals from './pages/Goals'
import Habits from './pages/Habits'
import Reflections from './pages/Reflections'
import BecomeMentor from './pages/BecomeMentor'
import About from './pages/About'
import Contact from './pages/Contact'
import Partners from './pages/Partners'
import Careers from './pages/Careers'
import Guidelines from './pages/Guidelines'
import FAQ from './pages/FAQ'
import Help from './pages/Help'

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mentors" element={<BrowseMentors />} />
              <Route path="/mentors/:id" element={<MentorProfile />} />
              <Route path="/community" element={<Community />} />
              <Route path="/events" element={<Events />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mentee-home" element={<MenteeHome />} />
              <Route path="/book/:mentorId" element={<BookSession />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/journeys" element={<Reflections />} />
              <Route path="/become-mentor" element={<BecomeMentor />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  )
}

export default App


