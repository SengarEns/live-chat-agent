import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
// import { getStorage, connectStorageEmulator } from "firebase/storage";

// Read Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Validate that necessary config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase configuration error: Missing API Key or Project ID in environment variables.");
    // You might want to throw an error or handle this case more gracefully
    // depending on whether Firebase is essential for the app's core functionality
    // For this app, authentication is core, so we'll log the error.
    // The AuthProvider will show a more user-friendly error.
}


// Initialize Firebase
let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        // Handle initialization error (e.g., invalid config)
        // The AuthProvider might catch this implicitly if auth fails.
    }

} else {
    app = getApp();
}


// Ensure app is initialized before getting services
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
// const functions = app ? getFunctions(app) : null;
// const storage = app ? getStorage(app) : null;


// Connect to emulators if running locally and services are available
// Check typeof window to ensure this runs only on the client-side for emulators
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === "localhost") {
  console.log("Connecting to Firebase emulators (if available)");
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
           // Check if already connected
           // Firestore doesn't expose a simple 'emulatorConfig' like auth,
           // so we rely on the console logs or potential errors if already connected.
           // A robust check might involve trying a simple read/write in a try/catch,
           // but that's likely overkill here.
           connectFirestoreEmulator(db, "localhost", 8080);
           console.log("Firestore Emulator connected.");

      } else {
           console.warn("Firebase Firestore service not available for emulator connection.");
      }

    //   if (functions) connectFunctionsEmulator(functions, "localhost", 5001);
    //   if (storage) connectStorageEmulator(storage, "localhost", 9199);
  } catch (error) {
      console.error("Error connecting to Firebase Emulators:", error);
  }

} else {
    console.log("Connecting to Production Firebase (or emulators not configured/running)");
}


export { app, auth, db };
