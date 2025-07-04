import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import VenuesPage from './pages/VenuesPage'
import VenueDetailPage from './pages/VenueDetailPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/venue/:id" element={<VenueDetailPage />} />
          <Route path="/" element={<VenuesPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 