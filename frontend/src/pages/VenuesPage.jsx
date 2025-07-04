import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const VenuesPage = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchVenues()
  }, [activeFilter])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/venues?filter=${activeFilter}`)
      setVenues(response.data)
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filters = [
    { id: 'all', label: 'Tümü' },
    { id: 'paid', label: 'Ücretli' },
    { id: 'free', label: 'Gençlik Ekipleri Ücretsiz' }
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading venues...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeFilter === filter.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {venues.map((venue) => (
          <Link
            key={venue.id}
            to={`/venue/${venue.id}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
          >
            <div className="aspect-w-16 aspect-h-10 relative">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {venue.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {venue.location}
              </p>
              <p className="text-sm text-gray-500">
                Capacity: {venue.capacity}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {venues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No venues found for the selected filter.</p>
        </div>
      )}
    </div>
  )
}

export default VenuesPage 