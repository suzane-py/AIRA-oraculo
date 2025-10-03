
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDN12UYOTykrhmsq2TDLJfdhXD17H4eqz4",
  authDomain: "aira-24412.firebaseapp.com",
  projectId: "aira-24412",
  storageBucket: "aira-24412.firebasestorage.app",
  messagingSenderId: "165603180199",
  appId: "1:165603180199:web:36399009f62284e0ae2582",
  measurementId: "G-7VV8XHKFJ9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };