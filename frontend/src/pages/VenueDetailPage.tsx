import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Venue {
  id: string;
  name: string;
  image: string;
  location: string;
  capacity: number;
  overview: string;
  amenities: string[];
}

const mockDates = ['2024-07-10', '2024-07-11', '2024-07-12', '2024-07-13', '2024-07-14'];

export default function VenueDetailPage() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/venues/${id}`)
      .then(res => setVenue(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReserve = async () => {
    if (!selectedDate || !venue) return;
    setReserving(true);
    await axios.post('http://localhost:8080/api/reservations', { venueId: venue.id, date: selectedDate });
    setReserving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!venue) return <div className="p-8">Venue not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <img src={venue.image} alt={venue.name} className="w-full h-56 object-cover rounded mb-4" />
      <h1 className="text-2xl font-bold mb-2">{venue.name}</h1>
      <div className="text-gray-600 mb-1">{venue.location}</div>
      <div className="text-gray-500 text-sm mb-2">Capacity: {venue.capacity}</div>
      <div className="mb-4">{venue.overview}</div>
      <div className="mb-4 flex gap-2">
        {venue.amenities.slice(0, 3).map((a, i) => (
          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{a}</span>
        ))}
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-2">Select a date:</div>
        <div className="flex gap-2">
          {mockDates.map(date => (
            <button
              key={date}
              className={`px-3 py-2 rounded border ${selectedDate === date ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </button>
          ))}
        </div>
      </div>
      <button
        className="w-full py-3 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
        disabled={!selectedDate || reserving}
        onClick={handleReserve}
      >
        {reserving ? 'Reserving...' : 'Reserve Venue'}
      </button>
      {success && <div className="mt-4 text-green-600">Reservation successful!</div>}
    </div>
  );
} 