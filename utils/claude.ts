import Constants from 'expo-constants';
import { getClaudeAPIKey } from './env';

interface ClaudeResponse {
  content: any;
  error?: string;
}

/**
 * Makes a request to the Claude API to get JSON-formatted data
 * @param prompt The user's prompt
 * @returns Formatted JSON data or error message
 */
export async function queryClaudeForJSON(prompt: string): Promise<ClaudeResponse> {
  try {
    // Get API key using our helper function
    const apiKey = getClaudeAPIKey();
    
    if (!apiKey) {
      throw new Error('API key not found. Make sure EXPO_PUBLIC_ANTHROPIC_API_KEY is set in .env.local');
    }

    console.log('Making request to Claude API...');
    
    // Prepare the request to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nPlease format your response as valid JSON only. No markdown, no explanations. Always include a "citation" field with source information when applicable.`
          }
        ],
        system: "You are a helpful AI assistant that provides information in JSON format only. No explanations or markdown. Always include a 'citation' field in your JSON response with source information when providing factual information. The citation should include source title, author (if available), publication date (if available), and URL (if available)."
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response from Claude');
    }

    // Parse the content to get the JSON
    try {
      const content = JSON.parse(data.content[0].text);
      return { content };
    } catch (parseError) {
      // If parsing fails, return the raw text
      return { 
        content: { 
          rawResponse: data.content[0].text,
          note: "Claude returned non-JSON data that couldn't be parsed"
        } 
      };
    }
  } catch (error: any) {
    console.error('Error querying Claude:', error);
    return { content: null, error: error.message };
  }
} 