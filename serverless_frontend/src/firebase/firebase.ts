// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const uploadImage = async (image: File, product_id: string) => {
  const storageRef = ref(storage, `product_image/${product_id}`);
  const uploadTask = await uploadBytes(storageRef, image);

  console.log(uploadTask);
};

export const getImageURL = async (product_id: string) => {
  try {
    const storageRef = ref(storage, `product_image/${product_id}`);
    const url = await getDownloadURL(storageRef);
    console.log(url)
    return url;
  } catch (error) {
    console.error(
      `Image not found for product ${product_id}, using default image.`
    );
    return "/no-image.png"; // Return default image URL if not found
  } 
};