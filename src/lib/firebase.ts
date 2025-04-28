
import { initializeApp, getApps, getApp, FirebaseError } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// Removed getAnalytics as it's not explicitly used elsewhere and could cause issues if not configured properly.
// import { getAnalytics } from "firebase/analytics";

// Use the configuration provided by the user.
// Ensure these values exactly match the Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyDYWqzmWbaF1mj7c1Tyj5jWckiXFha0izQ",
  authDomain: "live-agent-chat-application.firebaseapp.com",
  projectId: "live-agent-chat-application",
  storageBucket: "live-agent-chat-application.appspot.com", // Use .appspot.com for storageBucket
  messagingSenderId: "1091506966706",
  appId: "1:1091506966706:web:dea93a90fd21c7ad64b9ab",
  measurementId: "G-88S581VDRD" // Optional
};

// Initialize Firebase
let app;
let auth = null;
let db = null;
// let analytics = null;

try {
    // Check if Firebase app already exists to avoid reinitialization errors
    if (!getApps().length) {
        console.log("Initializing Firebase app with config:", firebaseConfig);
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully.");
    } else {
        app = getApp(); // Get the existing app instance
        console.log("Existing Firebase app instance retrieved.");
    }

    // Ensure app is initialized before getting services
    if (app) {
        try {
            auth = getAuth(app);
            console.log("Firebase Auth service obtained.");
        } catch (error) {
            console.error("Failed to get Firebase Auth service:", error);
        }

        try {
            db = getFirestore(app);
            console.log("Firebase Firestore service obtained.");
        } catch (error) {
            console.error("Failed to get Firebase Firestore service:", error);
        }

        // try {
        //     analytics = getAnalytics(app); // Initialize if needed later
        //     console.log("Firebase Analytics service obtained.");
        // } catch (error) {
        //     console.error("Failed to get Firebase Analytics service:", error);
        // }


        // Connect to emulators if running locally and services are available
        // Check typeof window to ensure this runs only on the client-side for emulators
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === "localhost") {
            console.log("Development environment detected. Attempting to connect to Firebase emulators...");
            try {
                if (auth) {
                    // Check if already connected to prevent errors on HMR
                    if (!auth.emulatorConfig) {
                        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
                        console.log("Auth Emulator connected to http://localhost:9099.");
                    } else {
                        console.log("Auth Emulator already connected.");
                    }
                } else {
                    console.warn("Firebase Auth service not available for emulator connection.");
                }

                if (db) {
                    // It's harder to check if Firestore emulator is already connected without causing potential issues.
                    // Let's assume connectFirestoreEmulator handles reconnection gracefully or throws if already connected.
                    // Avoid checking db.emulatorConfig as it might not exist or behave consistently.
                    try {
                        connectFirestoreEmulator(db, "localhost", 8080);
                        console.log("Firestore Emulator connected to localhost:8080.");
                    } catch (e: any) {
                        // Catch potential errors if already connected (though Firestore SDK might handle this)
                        if (e.message.includes("already connected")) {
                            console.log("Firestore Emulator already connected.");
                        } else {
                             console.error("Error connecting Firestore Emulator:", e);
                        }
                    }
                } else {
                    console.warn("Firebase Firestore service not available for emulator connection.");
                }

            } catch (error) {
                console.error("Error connecting to Firebase Emulators:", error);
            }

        } else {
            console.log("Connecting to Production Firebase (or emulators not running/configured).");
        }

    } else {
         console.error("Firebase app initialization failed, services cannot be obtained.");
    }

} catch (error: any) {
    console.error("Firebase initialization failed:", error);
    // Provide more specific feedback if possible
    if (error instanceof FirebaseError) {
         console.error(`Firebase Error Code: ${error.code}`);
         console.error(`Firebase Error Message: ${error.message}`);
         if(error.code === 'auth/invalid-api-key' || error.message.includes('API key not valid')) {
             console.error("Suggestion: Double-check the 'apiKey' in your firebaseConfig.");
         }
         if(error.message.includes('project') || error.code.includes('project')) {
             console.error("Suggestion: Verify the 'projectId' in your firebaseConfig matches your Firebase project.");
         }
    }
    // Handle initialization error (e.g., invalid config) - perhaps set a global error state
}


export { app, auth, db };
