import React, { useState } from "react";
import { Alert, GestureResponderEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { supabase } from "@/utils/supabase"; // Import our Supabase client
import { cssInterop } from "nativewind";

// Apply nativewind styling to SafeAreaView
cssInterop(SafeAreaView, { className: "style" });

export default function AuthScreen() {
  // State variables to hold email, password, and loading status
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  // Function to handle signing in
  async function signInWithEmail(e?: GestureResponderEvent) {
    if (e) e.preventDefault(); // Prevent default form submission
    setSigningIn(true); // Start loading indicator
    // Call Supabase sign in function
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Show an alert if there's an error
      Alert.alert("Sign In Error", error.message);
    }
    // If successful, the auth state change listener (which we'll set up later)
    // will navigate the user to the main app screen.
    setSigningIn(false); // Stop loading indicator
  }

  // Function to handle signing up
  async function signUpWithEmail(e?: GestureResponderEvent) {
    if (e) e.preventDefault(); // Prevent default form submission
    setSigningUp(true); // Start loading indicator
    // Call Supabase sign up function
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      // Show an alert if there's an error
      Alert.alert("Sign Up Error", error.message);
    } else {
      // Optionally, show a success message or confirmation instruction
      Alert.alert(
        "Sign Up Success",
        "Please check your email for verification!"
      );
    }
    setSigningUp(false); // Stop loading indicator
  }

  return (
    // Use SafeAreaView to avoid notches and system UI elements
    <SafeAreaView className="flex-1 bg-background-0">
      {/* Center the content vertically and horizontally */}
      <VStack space="md" className="flex-1 justify-center items-center p-6">
        <Heading size="2xl" className="mb-4">
          Welcome!
        </Heading>
        <Text className="mb-6">Sign in or create an account.</Text>

        {/* Input container */}
        <VStack space="md" className="w-full max-w-sm">
          <Input>
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={setEmail} // Update email state on change
              autoCapitalize="none" // Don't automatically capitalize email
              keyboardType="email-address" // Show email keyboard layout
            />
          </Input>
          <Input>
            <InputField
              placeholder="Password"
              value={password}
              onChangeText={setPassword} // Update password state on change
              secureTextEntry // Hide password characters
            />
          </Input>
        </VStack>

        {/* Button container */}
        <VStack space="md" className="w-full max-w-sm mt-6">
          <Box>
            <Button
              onPress={signInWithEmail}
              disabled={signingIn || signingUp} // Disable when either action is loading
              action="primary" // Style as primary button
              variant="solid"
            >
              {/* Show loading text or regular text */}
              <ButtonText>{signingIn ? "Signing In..." : "Sign In"}</ButtonText>
            </Button>
          </Box>
          <Box>
            <Button
              onPress={signUpWithEmail}
              disabled={signingUp || signingIn} // Disable when either action is loading
              action="secondary" // Style as secondary button
              variant="outline"
            >
              <ButtonText>{signingUp ? "Signing Up..." : "Sign Up"}</ButtonText>
            </Button>
          </Box>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
