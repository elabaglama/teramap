import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { VenueCard } from '../components/VenueCard';

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  type: string;
  image: string;
}

export const VenueList = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/venues?type=${filter}`);
        setVenues(response.data);
      } catch (error) {
        console.error('Error fetching venues:', error);
      }
    };

    fetchVenues();
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded ${
              filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('free')}
            className={`px-4 py-2 rounded ${
              filter === 'free' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Free for Youth Teams
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            id={venue.id}
            name={venue.name}
            location={venue.location}
            capacity={venue.capacity}
            image={venue.image}
          />
        ))}
      </div>
    </div>
  );
}; 