// @refresh reset - This might be needed if HMR issues persist after fixing the error
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously, AuthErrorCodes } from 'firebase/auth'; // Import AuthErrorCodes
import { auth } from '@/lib/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // If no user, sign in anonymously
        setLoading(true); // Ensure loading is true before async operation
        setAuthError(null); // Reset error on new attempt
        try {
          // Check if API key is present before attempting sign-in
           if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "YOUR_API_KEY") {
             console.error("Firebase API Key is missing or is a placeholder. Please add it to your .env file.");
             setAuthError("Firebase API Key is missing or invalid. Please configure it in your .env file.");
             setLoading(false);
             return; // Stop execution if key is missing/placeholder
           }
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error: any) { // Catch specific Firebase errors
            console.error("Anonymous sign-in failed:", error);
            if (error.code === AuthErrorCodes.INVALID_API_KEY) {
               setAuthError("Firebase API Key is invalid. Please check your .env configuration.");
            } else {
               setAuthError(`Authentication failed: ${error.message}`);
            }
            // Handle error appropriately, maybe show an error message
        } finally {
            setLoading(false);
        }
      } else {
        setUser(currentUser);
        setAuthError(null); // Clear error if auth state changes successfully
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
                 {authError} Ensure your Firebase project setup and environment variables (`.env` file) are correct.
              </AlertDescription>
           </Alert>
       </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);