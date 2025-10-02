// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV7vtfBKd_6wyBFqf0L5ZaIoVnA2vMQJg",
  authDomain: "prepai-platform.firebaseapp.com",
  projectId: "prepai-platform",
  storageBucket: "prepai-platform.firebasestorage.app",
  messagingSenderId: "747610549424",
  appId: "1:747610549424:web:24133c8f851db21f315f75",
  measurementId: "G-BZ9SBZTLB8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;