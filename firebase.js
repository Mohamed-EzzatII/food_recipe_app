// Import the required Firebase functions
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Add more if needed, like firestore, etc.
import { getFirestore } from 'firebase/firestore'; // Add Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwZUFX3cuXjjdrHBoT4DVe-gtpQLYt7kw",
  authDomain: "dishdive-402a7.firebaseapp.com",
  projectId: "dishdive-402a7",
  storageBucket: "dishdive-402a7.appspot.com",
  messagingSenderId: "254393042602",
  appId: "1:254393042602:web:1dbfab6c92f01e7c8432d3",
  measurementId: "G-5EXEEZK718"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export what you need
export const auth = getAuth(app);
export const db = getFirestore(app); // Export Firestore instance
