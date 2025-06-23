import { onAuthStateChange, logOut, getCurrentUser } from './auth.js';

// Initialize navigation based on auth state
export function initializeNavAuth() {
  // Listen for auth state changes
  onAuthStateChange((user) => {
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
      <a href="/hub/profil.html" class="auth-button profile-btn">Profil</a>
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
        window.location.href = '/hub/index.html';
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  } else {
    // User is not logged in - show login and signup buttons
    const loginItem = document.createElement('li');
            loginItem.innerHTML = '<a href="/hub/giris.html" class="auth-button">Giriş Yap</a>';
    
    const signupItem = document.createElement('li');
    signupItem.innerHTML = '<a href="/hub/kaydol.html" class="signup-btn">Üye Ol</a>';
    
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