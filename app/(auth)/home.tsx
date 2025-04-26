import React, { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { supabase } from "@/utils/supabase"; // Import Supabase client
import { cssInterop } from "nativewind";

// Apply nativewind styling to SafeAreaView
cssInterop(SafeAreaView, { className: "style" });

export default function HomeScreen() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle signing out
  async function handleSignOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out Error", error.message);
      setLoading(false);
    }
    // If successful, the onAuthStateChange listener in _layout.tsx
    // will detect the change and navigate the user to the auth screen.
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      {/* Center content */}
      <VStack space="lg" className="flex-1 justify-center items-center p-6">
        {/* The text input */}
        <Input className="w-full max-w-sm">
          <InputField
            placeholder="Enter some text..."
            value={text}
            onChangeText={setText}
          />
        </Input>

        {/* Sign Out Button */}
        <Button
          onPress={handleSignOut}
          disabled={loading}
          action="negative" // Style as a destructive/negative action
          variant="outline"
          className="w-full max-w-sm"
        >
          <ButtonText>{loading ? "Signing Out..." : "Sign Out"}</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
