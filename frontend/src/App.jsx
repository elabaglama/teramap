import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VenuesPage from './pages/VenuesPage';
import './style.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/" element={<VenuesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 