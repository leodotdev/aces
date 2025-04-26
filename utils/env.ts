import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

/**
 * Attempts to load environment variables from a .env.local file
 * This is a workaround for Expo which doesn't natively support .env.local in all contexts
 */
export async function loadEnvVars() {
  try {
    // Check if we already have the API key
    if (Constants.expoConfig?.extra?.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
      console.log('API key already loaded from Constants');
      return true;
    }
    
    // Try to read the .env.local file
    const envPath = FileSystem.documentDirectory + '/.env.local';
    const fileExists = await FileSystem.getInfoAsync(envPath);
    
    if (!fileExists.exists) {
      console.log('.env.local file not found at:', envPath);
      return false;
    }
    
    const content = await FileSystem.readAsStringAsync(envPath);
    const lines = content.split('\n');
    
    // Process each line to extract key/value pairs
    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          // Set the environment variable
          process.env[key.trim()] = value.trim().replace(/["']/g, '');
        }
      }
    }
    
    console.log('Environment variables loaded from .env.local');
    return true;
  } catch (error) {
    console.error('Error loading environment variables:', error);
    return false;
  }
}

/**
 * Gets the Claude API key from available sources
 */
export function getClaudeAPIKey(): string | null {
  // First try process.env
  if (process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    return process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  }
  
  // Then try Constants
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
    return Constants.expoConfig.extra.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  }
  
  // If not found
  console.warn('Claude API key not found in environment variables or Constants');
  return null;
} 