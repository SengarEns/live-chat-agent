// @refresh reset - This might be needed if HMR issues persist after fixing the error
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously, AuthErrorCodes } from 'firebase/auth'; // Import AuthErrorCodes
import { auth } from '@/lib/firebase'; // auth might be null if initialization failed
import { Skeleton } from '@/components/ui/skeleton'; // Loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Import Alert
import { AlertTriangle } from 'lucide-react'; // Icon for alert
import { FirebaseError } from 'firebase/app'; // Import FirebaseError

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  authError: string | null; // Add state for auth errors
}

const AuthContext = createContext<AuthContextProps>({ user: null, loading: true, authError: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null); // State to hold auth error messages

  useEffect(() => {
    // Check if Firebase Auth service was initialized correctly
    if (!auth) {
        setAuthError("Firebase Authentication service failed to initialize. Check console and Firebase config in src/lib/firebase.ts.");
        setLoading(false);
        return; // Stop if auth is not available
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // If no user, try to sign in anonymously
        setLoading(true); // Ensure loading is true before async operation
        setAuthError(null); // Reset error on new attempt
        try {
          console.log("No current user, attempting anonymous sign-in...");
          // Attempt anonymous sign-in
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
          setAuthError(null); // Clear error on success
          console.log("Anonymous sign-in successful:", userCredential.user.uid);
        } catch (error: any) { // Catch specific Firebase errors
            console.error("Anonymous sign-in failed:", error);
            let errorMessage = `Authentication failed: ${error.message}`;
            if (error instanceof FirebaseError) {
                 errorMessage = `Authentication failed: ${error.message} (Code: ${error.code})`;
                 // Handle specific Firebase auth errors
                if (error.code === AuthErrorCodes.INVALID_API_KEY || error.code === 'auth/invalid-api-key') {
                   errorMessage = "Firebase API Key is invalid. Please check your Firebase configuration in src/lib/firebase.ts.";
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = "Network error during authentication. Please check your internet connection and Firebase backend status/rules.";
                } else if (error.code === 'auth/operation-not-allowed') {
                     errorMessage = "Anonymous sign-in is not enabled in your Firebase project settings. Please enable it in the Firebase console (Authentication > Sign-in method).";
                } else if (error.message.includes('CONFIGURATION_NOT_FOUND')) {
                    errorMessage = "Firebase configuration not found or invalid. Please verify your project settings (Project ID, API Key) in src/lib/firebase.ts and ensure the Firebase project exists and is correctly set up.";
                }
            } else if (error.message && error.message.includes('CONFIGURATION_NOT_FOUND')) {
                // Catch cases where it might not be a FirebaseError instance but contains the message
                 errorMessage = "Firebase configuration not found or invalid. Please verify your project settings (Project ID, API Key) in src/lib/firebase.ts and ensure the Firebase project exists and is correctly set up.";
            }

            setAuthError(errorMessage);
        } finally {
            setLoading(false);
        }
      } else {
        // User is already signed in (or successfully signed in anonymously above)
        setUser(currentUser);
        setAuthError(null); // Clear error if auth state changes successfully
        setLoading(false);
        console.log("User already signed in or session restored:", currentUser.uid);
      }
    }, (error) => {
        // Handle errors during the listener setup/execution itself
        console.error("Error in onAuthStateChanged listener:", error);
        setAuthError(`Authentication listener error: ${error.message}`);
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array: run only once on mount

  // Show loading skeleton while authenticating
  if (loading) {
    return (
      <div className="flex flex-col space-y-3 p-4">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  // Show error message if authentication failed
   if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-lg"> {/* Increased max-width */}
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                 {authError}
                 <br /><br />
                 Please check the following:
                 <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Verify the Firebase configuration details (apiKey, projectId, authDomain etc.) in <strong>src/lib/firebase.ts</strong> are correct for your project.</li>
                    <li>Ensure Anonymous sign-in is enabled in the Firebase Console (Authentication &gt; Sign-in method).</li>
                    <li>If using API key restrictions (HTTP referrers, etc.) in Google Cloud Console, ensure they allow your development environment (e.g., `localhost` with the correct port) or temporarily disable them for testing.</li>
                    <li>Check your internet connection and if Firebase services are experiencing outages.</li>
                    <li>Review browser console logs for more detailed error messages.</li>
                 </ul>
              </AlertDescription>
           </Alert>
       </div>
    );
  }

  // Render children only if user is authenticated (or anonymous sign-in worked) and no error
  return (
    <AuthContext.Provider value={{ user, loading, authError }}>
      {/* Render children immediately if user exists, otherwise wait for loading to finish */}
      {/* If loading is finished and user is still null, something might be wrong, but AuthProvider handles the error display */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
