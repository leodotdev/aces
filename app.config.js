require('dotenv/config');

// Default configuration
module.exports = ({ config }) => {
  // Log env variables for debugging
  console.log('ENV variables loaded:', !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY);
  
  // Get current app.json configuration
  const currentConfig = { ...config };

  // Add environment variables to extra section
  return {
    ...currentConfig,
    extra: {
      ...currentConfig.extra,
      EXPO_PUBLIC_ANTHROPIC_API_KEY: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    },
  };
}; 