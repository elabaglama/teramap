import React from 'react';

const Header = () => {
  return (
    <header>
      <nav>
        <div className="logo">
          <a href="/">teramap</a>
        </div>
        <ul className="nav-links">
          <li><a href="/app/venues" className="active">Venues</a></li>
          <li><a href="/app/messages">Messages</a></li>
          <li><a href="/app/notifications">Notifications</a></li>
          <li>
            <div className="profile-avatar">
              <img src="/images/general/profile-placeholder.jpg" alt="Profile" />
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 