import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';

// Check authentication state and redirect if needed
export function setupAuthGuard(requireAuth = false, redirectPath = '/hub') {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (requireAuth && !user) {
        // User must be logged in but isn't
        window.location.href = '/hub/giris';
      } else if (!requireAuth && user && window.location.pathname.includes('/giris')) {
        // User is logged in but on login page
        window.location.href = redirectPath;
      }
      
      unsubscribe();
      resolve(user);
    });
  });
}

// Check if user is authenticated (async)
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Setup navigation based on auth state
export function setupAuthBasedNavigation() {
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.getElementById('auth-buttons');
    const userButtons = document.getElementById('user-buttons');
    
    if (authButtons && userButtons) {
      if (user) {
        authButtons.style.display = 'none';
        userButtons.style.display = 'flex';
      } else {
        authButtons.style.display = 'flex';
        userButtons.style.display = 'none';
      }
    }
  });
}

// Initialize navigation based on auth state
export function initializeNavAuth() {
  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    updateNavigation(user);
  });
}

// Update navigation based on user state
function updateNavigation(user) {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  // Remove existing auth buttons
  const existingAuthButtons = navLinks.querySelectorAll('.auth-button, .signup-btn');
  existingAuthButtons.forEach(btn => btn.remove());

  if (user) {
    // User is logged in - show logout button and user info
    const userMenu = document.createElement('li');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
      <a href="/hub/profil" class="auth-button profile-btn">Profil</a>
      <a href="#" class="auth-button logout-btn">Çıkış Yap</a>
    `;
    
    navLinks.appendChild(userMenu);
    
    // Add logout functionality
    const logoutBtn = userMenu.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await logOut();
        // Redirect to hub landing page after logout
        window.location.href = '/hub';
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  } else {
    // User is not logged in - show login and signup buttons
    const loginItem = document.createElement('li');
            loginItem.innerHTML = '<a href="/hub/giris" class="auth-button">Giriş Yap</a>';
    
    const signupItem = document.createElement('li');
    signupItem.innerHTML = '<a href="/hub/kaydol" class="signup-btn">Üye Ol</a>';
    
    navLinks.appendChild(loginItem);
    navLinks.appendChild(signupItem);
  }
}

// Get current user info
export function getCurrentUserInfo() {
  return getCurrentUser();
}

// Check if user is authenticated
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNavAuth);
} else {
  initializeNavAuth();
} 