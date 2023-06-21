// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB29QXaXqW0bLXMHyxbEs2owOXs8W5rcec",
  authDomain: "utm-badves.firebaseapp.com",
  databaseURL: "https://utm-badves-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "utm-badves",
  storageBucket: "utm-badves.appspot.com",
  messagingSenderId: "325522809432",
  appId: "1:325522809432:web:198bd8718748b6598ba02d",
  measurementId: "G-S9Q54NH850"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);