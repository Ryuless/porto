import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Config from Firebase snippet
const firebaseConfig = {
  apiKey: "AIzaSyDfegc8Z59hdhWID27hDLSEMg8m3Mjv3s0",
  authDomain: "myportofolio-a22bc.firebaseapp.com",
  projectId: "myportofolio-a22bc",
  storageBucket: "myportofolio-a22bc.firebasestorage.app",
  messagingSenderId: "981227711118",
  appId: "1:981227711118:web:f7246eddfcb0c5bc1df7df",
  measurementId: "G-4PQP915E1F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
