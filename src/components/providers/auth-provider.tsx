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
        setAuthError("Firebase Authentication service failed to initialize. Check console and Firebase config.");
        setLoading(false);
        return; // Stop if auth is not available
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // If no user, try to sign in anonymously
        setLoading(true); // Ensure loading is true before async operation
        setAuthError(null); // Reset error on new attempt
        try {
          // Removed explicit check for NEXT_PUBLIC_FIREBASE_API_KEY as config is now hardcoded in firebase.ts
          // Attempt anonymous sign-in
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
          setAuthError(null); // Clear error on success
          console.log("Anonymous sign-in successful:", userCredential.user.uid);
        } catch (error: any) { // Catch specific Firebase errors
            console.error("Anonymous sign-in failed:", error);
            // Handle specific Firebase auth errors
            if (error.code === AuthErrorCodes.INVALID_API_KEY) {
               setAuthError("Firebase API Key is invalid. Please check your Firebase configuration.");
            } else if (error.code === 'auth/network-request-failed') {
                setAuthError("Network error during authentication. Please check your internet connection and Firebase backend status/rules.");
            } else if (error.code === 'auth/operation-not-allowed') {
                 setAuthError("Anonymous sign-in is not enabled in your Firebase project settings.");
            }
             else {
               setAuthError(`Authentication failed: ${error.message} (Code: ${error.code})`);
            }
        } finally {
            setLoading(false);
        }
      } else {
        // User is already signed in (or successfully signed in anonymously above)
        setUser(currentUser);
        setAuthError(null); // Clear error if auth state changes successfully
        setLoading(false);
        console.log("User already signed in:", currentUser.uid);
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
          <Alert variant="destructive" className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                 {authError} Please ensure your Firebase project setup (in `src/lib/firebase.ts`) is correct and that the necessary sign-in methods are enabled in the Firebase console. Check browser console logs for more details.
              </AlertDescription>
           </Alert>
       </div>
    );
  }

  // Render children only if user is authenticated (or anonymous sign-in worked) and no error
  return (
    <AuthContext.Provider value={{ user, loading, authError }}>
      {user ? children : null /* Or render a specific "Login Required" component if user is null after loading and no error */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
