import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VenuesPage from './pages/VenuesPage';
import VenueDetailPage from './pages/VenueDetailPage';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/venues/:id" element={<VenueDetailPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
