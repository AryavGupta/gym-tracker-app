import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDdBVXwIOixdL2bWPS4qTSDZsSGAV8aCs4",
  authDomain: "gym-progress-d1b0c.firebaseapp.com",
  projectId: "gym-progress-d1b0c",
  storageBucket: "gym-progress-d1b0c.appspot.com",
  messagingSenderId: "339302650752",
  appId: "1:339302650752:web:9095187dc1f3f41a3c6765",
  measurementId: "G-KDT3198NDV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// export { db };
