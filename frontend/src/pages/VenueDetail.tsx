import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

interface Amenity {
  name: string;
  icon: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  image: string;
  overview: string;
  amenities: Amenity[];
}

export const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await axios.get(`${API_URL}/venues/${id}`);
        setVenue(response.data);
      } catch (error) {
        console.error('Error fetching venue:', error);
      }
    };

    fetchVenue();
  }, [id]);

  const handleReservation = async () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    try {
      await axios.post(`${API_URL}/reservations`, {
        venueId: id,
        date: selectedDate,
      });
      alert('Reservation successful!');
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('Failed to make reservation');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (!venue) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-64 object-cover rounded-lg"
          />
          <h1 className="text-3xl font-bold mt-4">{venue.name}</h1>
          <div className="mt-2 text-gray-600">
            <p>{venue.location}</p>
            <p>Capacity: {venue.capacity}</p>
          </div>
          <p className="mt-4 text-gray-700">{venue.overview}</p>
          <div className="mt-6 flex gap-4">
            {venue.amenities.map((amenity) => (
              <div key={amenity.name} className="flex items-center gap-2">
                <span className="text-gray-600">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                className="text-gray-600"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                className="text-gray-600"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-gray-600 font-semibold">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {Array.from({ length: days }).map((_, index) => {
                const day = index + 1;
                const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateString === selectedDate;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateString)}
                    className={`text-center py-2 rounded ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleReservation}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reserve Venue
          </button>
        </div>
      </div>
    </div>
  );
}; 