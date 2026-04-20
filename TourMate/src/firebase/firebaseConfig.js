import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD08sagTBQsrHQ-8v9iw_BsrwG6qiVIoZs", // Llave actualizada sin espacios
  authDomain: "tourmate-e17d3.firebaseapp.com",
  projectId: "tourmate-e17d3",
  storageBucket: "tourmate-e17d3.firebasestorage.app",
  messagingSenderId: "772056151082",
  appId: "1:772056151082:web:097df2134085fa55977f53",
  measurementId: "G-XXLC831R74"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);