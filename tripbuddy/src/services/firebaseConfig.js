// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbGpcr7i4LMttVqktaOnnvTh2Kt3YySWk",
  authDomain: "tripbuddy-ai-500117.firebaseapp.com",
  projectId: "tripbuddy-ai-500117",
  storageBucket: "tripbuddy-ai-500117.firebasestorage.app",
  messagingSenderId: "1055293205217",
  appId: "1:1055293205217:web:12f2258f12a0e4b26365a0",
  measurementId: "G-15W4WCMFJZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)