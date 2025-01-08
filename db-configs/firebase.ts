// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "mozai-1a065.firebaseapp.com",
  projectId: "mozai-1a065",
  storageBucket: "mozai-1a065.firebasestorage.app",
  messagingSenderId: "531634420897",
  appId: "1:531634420897:web:dacddb0ced506ab71484e0",
  measurementId: "G-0TQZB0MCXE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export {db}