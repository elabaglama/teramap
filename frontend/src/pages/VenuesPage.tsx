import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Venue {
  id: string;
  name: string;
  image: string;
  location: string;
  capacity: number;
  paid: boolean;
  freeForYouth: boolean;
}

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Free for Youth Teams', value: 'free' },
];

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8080/api/venues?filter=${filter}`)
      .then((res) => setVenues(res.data))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Venues</h1>
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`px-4 py-2 rounded border ${filter === f.value ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : venues.length === 0 ? (
        <div>No venues found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {venues.map((venue) => (
            <a
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <img src={venue.image} alt={venue.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{venue.name}</h2>
                <div className="text-gray-600 text-sm mb-1">{venue.location}</div>
                <div className="text-gray-500 text-xs">Capacity: {venue.capacity}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
} 