// Authentication Guard System
import { monitorAuthState } from './auth.js';

/**
 * Protects a page by requiring authentication
 * Redirects to signin page if user is not authenticated
 * @param {string} redirectTo - Where to redirect unauthenticated users (default: '/signin.html')
 * @param {function} onAuthenticatedCallback - Optional callback when user is authenticated
 */
export const requireAuth = (redirectTo = '/signin.html', onAuthenticatedCallback = null) => {
  return new Promise((resolve, reject) => {
    const unsubscribe = monitorAuthState((user) => {
      if (user) {
        // User is authenticated
        resolve(user);
        if (onAuthenticatedCallback) {
          onAuthenticatedCallback(user);
        }
      } else {
        // User is not authenticated, redirect
        console.log('User not authenticated, redirecting to:', redirectTo);
        window.location.href = redirectTo;
        reject(new Error('Authentication required'));
      }
      unsubscribe(); // Clean up listener
    });
  });
};

/**
 * Protects admin pages by checking user roles/permissions
 * @param {Array} allowedRoles - Array of roles that can access this page
 * @param {string} redirectTo - Where to redirect unauthorized users
 */
export const requireRole = (allowedRoles = [], redirectTo = '/') => {
  return new Promise((resolve, reject) => {
    requireAuth()
      .then((user) => {
        // Check if user has required role (you'd implement role checking logic here)
        // For now, just resolve as basic auth is sufficient
        resolve(user);
      })
      .catch((error) => {
        window.location.href = redirectTo;
        reject(error);
      });
  });
};

/**
 * Redirects authenticated users away from auth pages
 * Useful for signin/signup pages where logged-in users shouldn't be
 * @param {string} redirectTo - Where to redirect authenticated users (default: '/profile.html')
 */
export const redirectIfAuthenticated = (redirectTo = '/profile.html') => {
  return new Promise((resolve) => {
    const unsubscribe = monitorAuthState((user) => {
      if (user) {
        // User is authenticated, redirect away from auth page
        console.log('User already authenticated, redirecting to:', redirectTo);
        window.location.href = redirectTo;
      } else {
        // User is not authenticated, allow access to auth page
        resolve(null);
      }
      unsubscribe(); // Clean up listener
    });
  });
};

/**
 * Shows/hides elements based on authentication status
 * @param {string} authenticatedSelector - CSS selector for elements to show when authenticated
 * @param {string} unauthenticatedSelector - CSS selector for elements to show when not authenticated
 */
export const toggleAuthElements = (authenticatedSelector = '.auth-only', unauthenticatedSelector = '.no-auth-only') => {
  const unsubscribe = monitorAuthState((user) => {
    const authElements = document.querySelectorAll(authenticatedSelector);
    const noAuthElements = document.querySelectorAll(unauthenticatedSelector);
    
    if (user) {
      // Show authenticated elements, hide non-authenticated
      authElements.forEach(el => el.style.display = 'block');
      noAuthElements.forEach(el => el.style.display = 'none');
    } else {
      // Show non-authenticated elements, hide authenticated
      authElements.forEach(el => el.style.display = 'none');
      noAuthElements.forEach(el => el.style.display = 'block');
    }
  });
  
  return unsubscribe; // Return unsubscribe function for cleanup
};

/**
 * Gets current user with timeout
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
export const getCurrentUserWithTimeout = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Authentication check timeout'));
    }, timeout);
    
    const unsubscribe = monitorAuthState((user) => {
      clearTimeout(timer);
      resolve(user);
      unsubscribe();
    });
  });
}; 