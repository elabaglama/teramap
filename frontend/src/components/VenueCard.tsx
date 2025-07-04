import React from 'react';
import { Link } from 'react-router-dom';

interface VenueCardProps {
  id: string;
  name: string;
  location: string;
  capacity: number;
  image: string;
}

export const VenueCard = ({ id, name, location, capacity, image }: VenueCardProps) => {
  return (
    <Link to={`/app/venues/${id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <div className="mt-2 text-gray-600">
            <p>{location}</p>
            <p>Capacity: {capacity}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}; 