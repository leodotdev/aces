# Claude API Integration

This app includes integration with Claude AI through the Anthropic API. To use this feature, you need to set up your environment variables properly.

## Setup Instructions

1. Create a `.env.local` file in the root of your project with the following content:

```
# Claude API key for the Anthropic API
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

2. Replace `your_anthropic_api_key_here` with your actual Anthropic API key.

3. Restart the development server to load the environment variables:

```bash
npm start -- --clear
```

## Feature Usage

Once configured, you can:

1. Enter a prompt in the text input at the bottom of the screen
2. Tap "Ask" to send the prompt to Claude
3. The response will be displayed as a card in the scrollable area

The response is formatted as JSON, which is perfect for structured data presentation.

## Troubleshooting

If you see an "API Key Issue" error:

- Make sure your `.env.local` file exists and contains the correct API key
- Confirm the API key is valid and has not expired
- Restart the development server to load the latest environment variables
