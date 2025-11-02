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
import BookSession from './pages/BookSession'

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
              <Route path="/book/:mentorId" element={<BookSession />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  )
}

export default App


