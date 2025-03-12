// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApD2pxCkCqiCZuqbGcpESHSl9H0jmSbyM",
  authDomain: "pc-express-45fa6.firebaseapp.com",
  projectId: "pc-express-45fa6",
  storageBucket: "pc-express-45fa6.firebasestorage.app",
  messagingSenderId: "684345712814",
  appId: "1:684345712814:web:3d9929018f0b7e3aae8d3f",
  measurementId: "G-LL33ZSR3ZN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);