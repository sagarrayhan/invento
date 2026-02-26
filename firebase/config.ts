
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB34eGqYuClUVE2WGoC7VpGFznj5xDkd5Y",
  authDomain: "inventory-170b9.firebaseapp.com",
  databaseURL: "https://inventory-170b9-default-rtdb.firebaseio.com",
  projectId: "inventory-170b9",
  storageBucket: "inventory-170b9.firebasestorage.app",
  messagingSenderId: "469675857186",
  appId: "1:469675857186:web:e86e4569c6806225af017b",
  measurementId: "G-RT09D9CEMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db =  getDatabase(app)