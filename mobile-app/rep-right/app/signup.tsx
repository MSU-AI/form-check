import React, { useState } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { Button, Input, YStack, Text, Stack } from "tamagui";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import "react-native-reanimated";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  async function handleSignUp() {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      router.replace("/(app)/(tabs)/camera");
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="#2b2433"
      padding="$6"
      space="$4"
    >
      {/* Logo Section */}
      <Stack id="logo" alignItems="center" marginBottom={20}>
        <Image
          source={require("../rep-right.png")}
          style={{ width: 300, height: 250 }}
          resizeMode="contain"
        />
      </Stack>

      <Text
        fontSize="$9"
        fontWeight="bold"
        color="white"
        textAlign="center"
      // marginBottom={10}
      >
        Sign Up
      </Text>

      {/* Sign-In Section */}
      <Stack
        id="signup-box"
        width={320}
        padding="$4"
        backgroundColor="white"
        borderRadius="$9"
        shadowColor="rgba(0, 0, 0, 0.3)"
        shadowRadius={5}
        shadowOffset={{ width: 0, height: 10 }}
        shadowOpacity={0.2}
        space={15}
      >
        {/* Email Input */}
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="gray"
          padding={12} // Slightly reduced padding
          borderRadius={8}
          color={"black"}
          borderWidth={1}
          borderColor="#ddd"
          backgroundColor="#f7f7f7" // Light gray background
        />

        {/* Password Input */}
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="gray"
          secureTextEntry
          padding={12} // Slightly reduced padding
          borderRadius={8}
          borderWidth={1}
          color={"black"}
          borderColor="#ddd"
          backgroundColor="#f7f7f7" // Light gray background
        />

        {/* Sign Up Button */}
        <Button
          onPress={handleSignUp}
          disabled={loading}
          backgroundColor="#8B5E5E" // Muted brown for consistency
          hoverStyle={{ backgroundColor: "#6f4f4f" }}
          color="white"
          paddingVertical={12}
          borderRadius={8}
          marginBottom={10}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>

        <Text
          textAlign="center"
          fontSize={14}
          color="#888"
          marginBottom={5}
          fontWeight="bold"
        >
          Already have an account?
        </Text>

        {/* Sign In Button */}
        <Button
          onPress={() => router.replace("/signin")}
          color="#007BFF"
          borderColor="#007BFF"
          borderWidth={1}
          borderRadius={8}
          paddingVertical={12}
          hoverStyle={{ backgroundColor: "#e6f0ff" }}
          marginTop={-10}
        >
          Sign In
        </Button>
      </Stack>
    </YStack>
  );
}
