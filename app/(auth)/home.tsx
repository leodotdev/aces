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
import { HStack } from "@/components/ui/hstack";
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

  // Function to add sample data for testing visualizations
  const addSampleData = () => {
    // Sample data examples for different chart types
    const sampleDatasets = [
      // Pie chart example
      {
        title: "Global Market Share by Browser",
        data: [
          { name: "Chrome", value: 64 },
          { name: "Safari", value: 19 },
          { name: "Firefox", value: 3.4 },
          { name: "Edge", value: 3.2 },
          { name: "Opera", value: 2.3 },
          { name: "Other", value: 8.1 },
        ],
        citation: {
          source: "StatCounter Global Stats",
          period: "January 2023",
          url: "statcounter.com/browser-market-share",
        },
      },
      // Bar chart example
      {
        title: "Average Monthly Temperatures",
        values: [5, 7, 10, 15, 20, 25, 28, 27, 22, 17, 12, 7],
        months: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        citation: {
          source: "Climate Data Repository",
          location: "New York City",
          year: 2022,
        },
      },
      // Line chart example for stock prices
      {
        title: "Stock Price Movement",
        data: [
          { x: 1, y: 145.42 },
          { x: 2, y: 146.71 },
          { x: 3, y: 148.56 },
          { x: 4, y: 149.04 },
          { x: 5, y: 152.87 },
          { x: 6, y: 156.11 },
          { x: 7, y: 157.65 },
          { x: 8, y: 154.32 },
          { x: 9, y: 158.61 },
          { x: 10, y: 160.77 },
          { x: 11, y: 162.88 },
          { x: 12, y: 164.9 },
          { x: 13, y: 163.76 },
          { x: 14, y: 168.82 },
        ],
        period: "March 1-14, 2023",
        ticker: "AAPL",
        citation: {
          source: "Financial Data Provider",
          disclaimer:
            "Historical data for demonstration purposes only. Not investment advice.",
        },
      },
      // Simple numeric array example
      {
        title: "Age Distribution in Survey Participants",
        data: [24, 31, 28, 42, 35, 29, 37],
        categories: [
          "Group A",
          "Group B",
          "Group C",
          "Group D",
          "Group E",
          "Group F",
          "Group G",
        ],
        citation: "Internal research study, 2023",
      },
    ];

    // Add a random sample dataset
    const randomIndex = Math.floor(Math.random() * sampleDatasets.length);
    setResponses((prev) => [
      ...prev,
      {
        ...sampleDatasets[randomIndex],
        timestamp: new Date().toISOString(),
      },
    ]);
  };

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
              Ask anything to get JSON responses with visualizations
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
                Ask a question to see Claude's response with visualizations here
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
          <VStack space="sm" className="p-4">
            <HStack space="md" className="w-full">
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
            </HStack>
            <Button
              onPress={addSampleData}
              variant="outline"
              action="secondary"
              className="w-full"
            >
              <ButtonText>Try Sample Data</ButtonText>
            </Button>
          </VStack>
        </SafeAreaView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
