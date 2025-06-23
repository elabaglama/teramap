# TeraMap Hub Portal

TeraMap Hub is a focused portal that provides access to venue exploration and user profiles.

## Features

- **Simplified Interface**: Clean, modern design focused on venues
- **User Authentication**: Firebase-based authentication with Google sign-in
- **Venue Exploration**: Browse and interact with available venues
- **Enhanced Profiles**: Detailed user profiles with activity tracking
- **Mobile Responsive**: Optimized for all device sizes

## Portal Structure

```
hub/
├── index.html          # Landing page with auth state management
├── giris.html          # Login page
├── kaydol.html         # Registration page
├── mekanlar.html       # Venues exploration page
└── profil.html         # Enhanced user profiles
```

## Pages

### 1. Landing Page (`index.html`)
- Shows different content based on authentication state
- Redirects authenticated users to venues
- Provides login/register options for guests

### 2. Authentication Pages
- **Login** (`giris.html`): Email/password and Google authentication
- **Register** (`kaydol.html`): Account creation with validation

### 3. Venues Page (`mekanlar.html`)
- Grid layout of available venues
- Interactive messaging system
- Real-time venue data loading
- Mobile-optimized cards

### 4. Profile Page (`profil.html`)
- User information management
- Activity tracking
- Statistics display
- Profile picture management

## Deployment

### Subdomain Setup
The hub portal is configured to be deployed as a subdomain:
- Production: `teramap.hub`
- Development: `hub.teramap.vercel.app`

### Vercel Configuration
Uses `vercel-hub.json` for subdomain-specific routing and settings.

## Authentication
- Firebase Authentication integration
- Automatic redirect handling
- Session management
- Secure logout functionality

## Data Sources
- Venues: `/data/venues.json`
- User profiles: Firebase user management
- Messages: Local handling (future backend integration)

## Usage

1. Visit the hub portal
2. Register or login
3. Explore venues and send messages
4. Manage your profile

## Future Enhancements
- Backend message system
- Advanced filtering
- Venue booking functionality
- Push notifications
- Real-time messaging 