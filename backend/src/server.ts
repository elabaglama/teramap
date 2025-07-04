import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Read venues data
const venuesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'venues.json'), 'utf-8')
);

// GET /api/venues - Get all venues with optional filter
app.get('/api/venues', (req, res) => {
  const { type } = req.query;
  let filteredVenues = venuesData.venues;

  if (type && type !== 'all') {
    filteredVenues = filteredVenues.filter((venue: any) => venue.type === type);
  }

  res.json(filteredVenues);
});

// GET /api/venues/:id - Get single venue
app.get('/api/venues/:id', (req, res) => {
  const venue = venuesData.venues.find((v: any) => v.id === req.params.id);
  
  if (!venue) {
    return res.status(404).json({ message: 'Venue not found' });
  }
  
  res.json(venue);
});

// POST /api/reservations - Create reservation
app.post('/api/reservations', (req, res) => {
  const { venueId, date } = req.body;
  
  // Log reservation (no DB for now)
  console.log('New reservation:', { venueId, date });
  
  res.json({ message: 'Reservation created successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 