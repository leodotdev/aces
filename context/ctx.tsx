// app/ctx.tsx
import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/utils/supabase"; // Use our existing Supabase client
import { Session, AuthError } from "@supabase/supabase-js";

// Define the shape of the context value
interface AuthContextType {
  signIn: (
    email?: string,
    password?: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email?: string,
    password?: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  session: Session | null;
  isLoading: boolean;
}

// Create the context with a default value (usually null or an object with default methods)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook to use the AuthContext
export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

// Create the SessionProvider component
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  // Effect to fetch the initial session and subscribe to auth changes
  useEffect(() => {
    setIsLoading(true);
    // 1. Get the initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((error) => {
        console.error("Error getting initial session:", error);
        // Handle error appropriately, maybe set session to null
        setSession(null);
      })
      .finally(() => {
        setIsLoading(false); // Initial check complete
      });

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); // Update session state on change
      // Note: We don't set isLoading here, only on the initial load
    });

    // 3. Cleanup listener on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Run only once on mount

  // Define the functions to be exposed by the context
  const value: AuthContextType = {
    signIn: async (email, password) => {
      // Basic validation
      if (!email || !password) {
        return {
          error: {
            name: "InputError",
            message: "Email and password are required.",
          } as AuthError,
        };
      }
      setIsLoading(true); // Optionally set loading during auth operations
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setIsLoading(false);
      return { error };
    },
    signUp: async (email, password) => {
      if (!email || !password) {
        return {
          error: {
            name: "InputError",
            message: "Email and password are required.",
          } as AuthError,
        };
      }
      setIsLoading(true);
      // Note: You might want to add options like redirect URLs here if needed
      const { error } = await supabase.auth.signUp({ email, password });
      setIsLoading(false);
      return { error };
    },
    signOut: async () => {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      setIsLoading(false);
      return { error };
    },
    session,
    isLoading,
  };

  // Provide the context value to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
