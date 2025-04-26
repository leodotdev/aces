// utils/supabase.ts

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Required for Supabase on React Native
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing session info

// Get the Supabase URL and Anon Key from environment variables
// process.env provides access to environment variables in Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Make sure they are set in your .env file and prefixed with EXPO_PUBLIC_'
  );
  // You might want to throw an error or handle this more gracefully
  // depending on your application's needs.
}

// Create and export the Supabase client
// We pass AsyncStorage to handle session persistence on mobile devices
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    // Use AsyncStorage for session persistence
    storage: AsyncStorage,
    // Automatically refresh the token
    autoRefreshToken: true,
    // Detect session in URL (useful for email links)
    detectSessionInUrl: false,
    // Persist session across app restarts
    persistSession: true,
  },
}); 