// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXUP9HjObwMOHGzQbcoSANVd7ye3JR2Kw",
  authDomain: "cornpanion.firebaseapp.com",
  databaseURL: "https://cornpanion-default-rtdb.firebaseio.com",
  projectId: "cornpanion",
  storageBucket: "cornpanion.firebasestorage.app",
  messagingSenderId: "189897565377",
  appId: "1:189897565377:web:f1e0f15f9dac5a22b36040",
  measurementId: "G-LYHCVGN1VC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { app, analytics, database };