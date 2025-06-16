// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCM22P5dhmlb9Pc5YfxxRj7PkygTQE9VYI",
  authDomain: "teramap.works",
  projectId: "tera-map-8f606",
  storageBucket: "tera-map-8f606.firebasestorage.app",
  messagingSenderId: "353801791768",
  appId: "1:353801791768:web:0a5b07df6ff8c7c488966d",
  measurementId: "G-ZZFLKLCVNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app; 