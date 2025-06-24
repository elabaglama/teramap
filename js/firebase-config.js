// Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaCK1u1z1mw4NrYW7-2rgP5AtriCybbYo",
  authDomain: "teramapcursor.firebaseapp.com",
  projectId: "teramapcursor",
  storageBucket: "teramapcursor.firebasestorage.app",
  messagingSenderId: "446128373922",
  appId: "1:446128373922:web:d04b8e9eb1863f053f57fb"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = getAuth(app);

// Set persistence to local storage (keeps user logged in across browser sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence ayarlama hatası:", error);
});

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();

// Optional: Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider }; 