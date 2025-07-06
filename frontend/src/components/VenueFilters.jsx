import React from 'react';

const VenueFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'Tümü' },
    { key: 'paid', label: 'Ücretli' },
    { key: 'free', label: 'Gençlik Ekiplerine Ücretsiz' }
  ];

  return (
    <div className="venue-filters">
      {filters.map(filter => (
        <button
          key={filter.key}
          className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default VenueFilters; 