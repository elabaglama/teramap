const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load venue data
const venuesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'venues.json'), 'utf8'));

// GET /api/venues - Get all venues with optional filtering
app.get('/api/venues', (req, res) => {
  const { filter } = req.query;
  
  let filteredVenues = venuesData;
  
  if (filter && filter !== 'all') {
    filteredVenues = venuesData.filter(venue => venue.type === filter);
  }
  
  res.json(filteredVenues);
});

// GET /api/venues/:id - Get single venue by ID
app.get('/api/venues/:id', (req, res) => {
  const { id } = req.params;
  const venue = venuesData.find(v => v.id === id);
  
  if (!venue) {
    return res.status(404).json({ error: 'Venue not found' });
  }
  
  res.json(venue);
});

// POST /api/reservations - Create a reservation (mock)
app.post('/api/reservations', (req, res) => {
  const { venueId, date, time } = req.body;
  
  // Mock reservation - just log to console
  console.log('New Reservation:');
  console.log(`Venue ID: ${venueId}`);
  console.log(`Date: ${date}`);
  console.log(`Time: ${time || 'Not specified'}`);
  console.log('---');
  
  // Simulate reservation creation
  const reservation = {
    id: Date.now().toString(),
    venueId,
    date,
    time,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(reservation);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TeraMap API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 