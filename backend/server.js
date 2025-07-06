const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/data', express.static(path.join(__dirname, '../data')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// API Routes
app.get('/api/venues', (req, res) => {
  try {
    const venuesData = fs.readFileSync(path.join(__dirname, '../data/venues.json'), 'utf8');
    const venues = JSON.parse(venuesData);
    res.json(venues);
  } catch (error) {
    console.error('Error reading venues data:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

app.get('/api/venues/:id', (req, res) => {
  try {
    const venuesData = fs.readFileSync(path.join(__dirname, '../data/venues.json'), 'utf8');
    const venues = JSON.parse(venuesData);
    const venue = venues.venues.find(v => v.id === req.params.id);
    
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    res.json(venue);
  } catch (error) {
    console.error('Error reading venue data:', error);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 