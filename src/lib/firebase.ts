
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Analytics is not used in the current app structure

// TODO: It's generally recommended to use environment variables for Firebase config in production.
// Hardcoding these values is suitable for quick setup or local development but poses a security risk if the code becomes public.
const firebaseConfig = {
  apiKey: "AIzaSyDYWqzmWbaF1mj7c1Tyj5jWckiXFha0izQ",
  authDomain: "live-agent-chat-application.firebaseapp.com",
  projectId: "live-agent-chat-application",
  storageBucket: "live-agent-chat-application.appspot.com", // Corrected domain extension
  messagingSenderId: "1091506966706",
  appId: "1:1091506966706:web:dea93a90fd21c7ad64b9ab",
  measurementId: "G-88S581VDRD" // Optional
};

// Initialize Firebase
let app;
// Check if Firebase app already exists to avoid reinitialization errors
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        // Handle initialization error (e.g., invalid config)
    }
} else {
    app = getApp(); // Get the existing app instance
    console.log("Existing Firebase app instance retrieved.");
}

// Ensure app is initialized before getting services
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
// const analytics = app ? getAnalytics(app) : null; // Initialize if needed later

// Connect to emulators if running locally and services are available
// Check typeof window to ensure this runs only on the client-side for emulators
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === "localhost") {
  console.log("Attempting to connect to Firebase emulators...");
  try {
      if (auth) {
        // Check if already connected to prevent errors on HMR
        if (!auth.emulatorConfig) {
           connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
           console.log("Auth Emulator connected.");
        } else {
             console.log("Auth Emulator already connected.");
        }
      } else {
          console.warn("Firebase Auth service not available for emulator connection.");
      }

      if (db) {
           // Firestore emulator connection (less straightforward to check if already connected)
           connectFirestoreEmulator(db, "localhost", 8080);
           console.log("Firestore Emulator connected.");

      } else {
           console.warn("Firebase Firestore service not available for emulator connection.");
      }

  } catch (error) {
      console.error("Error connecting to Firebase Emulators:", error);
  }

} else {
    console.log("Connecting to Production Firebase (or emulators not running/configured).");
}


export { app, auth, db };
