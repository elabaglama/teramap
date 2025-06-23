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
  const existingAuthButtons = navLinks.querySelectorAll('.auth-button, .signup-btn, .login-btn, .user-menu');
  existingAuthButtons.forEach(btn => btn.parentElement.remove());

  if (user) {
    // User is logged in - show logout button and user info
    const userMenuItem = document.createElement('li');
    userMenuItem.className = 'user-menu';
    userMenuItem.innerHTML = `
      <span class="user-name">Merhaba, ${user.displayName || user.email}</span>
      <a href="#" class="logout-btn">Çıkış Yap</a>
    `;
    
    navLinks.appendChild(userMenuItem);
    
    // Add logout functionality
    const logoutBtn = userMenuItem.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await logOut();
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  } else {
    // User is not logged in - show login and signup buttons
    const loginItem = document.createElement('li');
    loginItem.innerHTML = '<a href="/signin.html" class="login-btn">Giriş Yap</a>';
    
    const signupItem = document.createElement('li');
    signupItem.innerHTML = '<a href="/kaydol.html" class="signup-btn">Kaydol</a>';
    
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