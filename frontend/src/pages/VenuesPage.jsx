import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import VenueFilters from '../components/VenueFilters';
import VenueCard from '../components/VenueCard';

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [venues, activeFilter]);

  const fetchVenues = async () => {
    try {
      // Use absolute path from root
      const response = await fetch('/data/venues.json');
      const data = await response.json();
      setVenues(data.venues);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setLoading(false);
    }
  };

  const filterVenues = () => {
    let filtered = venues;
    
    switch (activeFilter) {
      case 'paid':
        filtered = venues.filter(venue => venue.isPaid);
        break;
      case 'free':
        filtered = venues.filter(venue => venue.isYouthFree);
        break;
      default:
        filtered = venues;
    }
    
    setFilteredVenues(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <main className="venues-page">
        <div className="page-header">
          <h1>Venues</h1>
        </div>
        
        <div className="venues-container">
          <div className="venues-content">
            <VenueFilters 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange} 
            />
            
            <div className="venues-grid">
              {filteredVenues.map(venue => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
            
            {filteredVenues.length === 0 && (
              <div className="no-venues">
                <p>Bu filtreye uygun mekan bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VenuesPage; 