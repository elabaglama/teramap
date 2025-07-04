import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900 italic">Temap</span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link to="/venues" className="text-gray-600 hover:text-gray-900 transition-colors">
              Venues
            </Link>
            <span className="text-gray-600">Messages</span>
            <span className="text-gray-600">Notifications</span>
          </nav>
          
          {/* Profile */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">E</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 