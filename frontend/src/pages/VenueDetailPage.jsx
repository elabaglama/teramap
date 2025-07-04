import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Calendar from '../components/Calendar'

const VenueDetailPage = () => {
  const { id } = useParams()
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isReserving, setIsReserving] = useState(false)

  useEffect(() => {
    fetchVenue()
  }, [id])

  const fetchVenue = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/venues/${id}`)
      setVenue(response.data)
    } catch (error) {
      console.error('Error fetching venue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReservation = async () => {
    if (!selectedDate) {
      alert('Please select a date first')
      return
    }

    try {
      setIsReserving(true)
      const response = await axios.post('/api/reservations', {
        venueId: venue.id,
        date: selectedDate,
        time: 'All day'
      })
      
      alert(`Reservation confirmed for ${selectedDate}!`)
      console.log('Reservation created:', response.data)
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Failed to create reservation. Please try again.')
    } finally {
      setIsReserving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading venue details...</div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Venue not found</p>
          <Link to="/venues" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Back to venues
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Venue Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-64 object-cover"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {venue.name}
            </h1>
            <p className="text-gray-600 mb-4">{venue.location}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Capacity</h3>
              <p className="text-gray-600">{venue.capacity} guests</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
              <p className="text-gray-600 leading-relaxed">
                {venue.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-1 gap-3">
                {venue.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-xl">{amenity.icon}</span>
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Calendar & Reservation */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              onClick={handleReservation}
              disabled={!selectedDate || isReserving}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedDate && !isReserving
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isReserving ? 'Reserving...' : 'Reserve Venue'}
            </button>
            
            {selectedDate && (
              <p className="text-sm text-gray-600 mt-3 text-center">
                Selected: {selectedDate}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Link 
          to="/venues" 
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to venues
        </Link>
      </div>
    </div>
  )
}

export default VenueDetailPage 