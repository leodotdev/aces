import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cssInterop } from "nativewind";
import { queryClaudeForJSON } from "@/utils/claude";
import { loadEnvVars } from "@/utils/env";
import { ResponseCard } from "@/components/custom/ResponseCard";
import { HamburgerMenu } from "@/components/custom/HamburgerMenu";

// Apply nativewind styling to SafeAreaView and other components
cssInterop(SafeAreaView, { className: "style" });
cssInterop(ScrollView, { className: "style" });
cssInterop(KeyboardAvoidingView, { className: "style" });

export default function HomeScreen() {
  // State variables for prompt input and results
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [isEnvLoaded, setIsEnvLoaded] = useState(false);

  // Load environment variables on component mount
  useEffect(() => {
    async function loadEnvironment() {
      try {
        const loaded = await loadEnvVars();
        setIsEnvLoaded(loaded);

        if (!loaded) {
          console.warn("Failed to load environment variables");
        }
      } catch (error) {
        console.error("Error loading environment:", error);
      }
    }

    loadEnvironment();
  }, []);

  // Function to handle submitting the prompt to Claude
  async function handleSubmitPrompt() {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const result = await queryClaudeForJSON(prompt);

      if (result.error) {
        // Add error message as a response
        setResponses((prev) => [
          ...prev,
          { error: true, message: result.error },
        ]);

        // Show alert for API key issues
        if (result.error.includes("API key")) {
          Alert.alert(
            "API Key Issue",
            "There's a problem with your Claude API key. Make sure it's set correctly in .env.local"
          );
        }
      } else if (result.content) {
        // Add the JSON response to our list
        setResponses((prev) => [
          ...prev,
          { ...result.content, timestamp: new Date().toISOString() },
        ]);
      }
    } catch (error: any) {
      console.error("Error processing prompt:", error);
      setResponses((prev) => [
        ...prev,
        { error: true, message: error.message || "An unknown error occurred" },
      ]);
    } finally {
      setIsLoading(false);
      setPrompt(""); // Clear input after submission
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-0"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <Box className="px-4 py-3 border-b border-gray-200 flex-row justify-between items-center">
          <Box>
            <Heading size="xl">Ask Claude</Heading>
            <Text className="text-gray-500">
              Ask anything to get JSON responses with citations
            </Text>
          </Box>
          <HamburgerMenu />
        </Box>

        {/* Body - Scrollable content area */}
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {responses.length === 0 ? (
            <Box className="items-center justify-center py-20">
              <Text className="text-gray-500 text-center">
                Ask a question to see Claude's response with source citations
                here
              </Text>
            </Box>
          ) : (
            <VStack space="md" className="py-4">
              {responses.map((response, index) => (
                <ResponseCard key={index} data={response} />
              ))}
            </VStack>
          )}
        </ScrollView>

        {/* Footer - Sticky input area */}
        <SafeAreaView
          edges={["bottom"]}
          className="border-t border-gray-200 bg-white"
        >
          <Box className="p-4 flex-row">
            <Input className="flex-1 mr-2">
              <InputField
                placeholder="Ask Claude for data..."
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={1}
              />
            </Input>
            <Button
              onPress={handleSubmitPrompt}
              disabled={isLoading || !prompt.trim()}
              action="primary"
              variant="solid"
            >
              <ButtonText>{isLoading ? "Thinking..." : "Ask"}</ButtonText>
            </Button>
          </Box>
        </SafeAreaView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
