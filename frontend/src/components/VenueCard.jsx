import React from 'react';

const VenueCard = ({ venue }) => {
  return (
    <div className="venue-card">
      <div 
        className="venue-image" 
        style={{ backgroundImage: `url(${venue.image})` }}
      ></div>
      <div className="venue-details">
        <h3>{venue.name}</h3>
        <div className="venue-meta">
          <div>
            <i className="fas fa-map-marker-alt"></i>
            <span>{venue.location}</span>
          </div>
          <div>
            <i className="fas fa-users"></i>
            <span>{venue.capacity}</span>
          </div>
        </div>
        <p className="venue-description">{venue.description}</p>
        <div className="venue-tags">
          {venue.features.map((feature, index) => (
            <span key={index} className="venue-tag">{feature}</span>
          ))}
        </div>
        <div className="venue-actions">
          <span className={`price-tag ${venue.isPaid ? 'paid' : 'free'}`}>
            {venue.price}
          </span>
          <button className="cta-button">
            İletişim
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard; 