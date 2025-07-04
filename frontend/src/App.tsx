import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VenueList } from './pages/VenueList';
import { VenueDetail } from './pages/VenueDetail';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/app/venues" element={<VenueList />} />
        <Route path="/app/venues/:id" element={<VenueDetail />} />
        <Route path="*" element={<Navigate to="/app/venues" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 