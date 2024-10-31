// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase  } from "firebase/database"
import { getStorage  } from "firebase/storage";

import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "chat-app-a66b0.firebaseapp.com",
    projectId: "chat-app-a66b0",
    storageBucket: "chat-app-a66b0.appspot.com",
    messagingSenderId: "181880470978",
    appId: "1:181880470978:web:b99f236f5f7921f981ea5b",
    databaseURL: 'https://chat-app-a66b0-default-rtdb.europe-west1.firebasedatabase.app'
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
