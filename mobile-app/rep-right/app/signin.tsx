import React, { useState } from "react";
import { useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button, Input, YStack, Text, Stack } from "tamagui";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  async function handleSignIn() {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
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
        Sign In
      </Text>

      {/* Sign-In Section */}
      <Stack
        id="signin-box"
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
          placeholderTextColor="#999"
          padding="$3"
          color={"black"}
          borderRadius="$4"
          borderWidth={1}
          borderColor="#e0e0e0"
          backgroundColor="#f7f7f7"
          // marginBottom={10}
        />

        {/* Password Input */}
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          padding="$3"
          color={"black"}
          borderRadius="$4"
          borderWidth={1}
          borderColor="#e0e0e0"
          backgroundColor="#f7f7f7"
          // marginBottom={15}
        />

        {/* Sign In Button */}
        <Button
          onPress={handleSignIn}
          disabled={loading}
          backgroundColor="#8B5E5E"
          hoverStyle={{ backgroundColor: "#6f4f4f" }}
          color="white"
          paddingVertical={12}
          borderRadius={8}
          shadowColor="rgba(0, 0, 0, 0.2)"
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 5 }}
          marginBottom={10}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        {/* Sign-Up Section */}
        <Text
          textAlign="center"
          fontSize={14}
          color="#888"
          marginBottom={5}
          fontWeight="bold"
        >
          Don't have an account?
        </Text>
        <Button
          variant="outlined"
          onPress={() => router.replace("/signup")}
          color="#007BFF"
          borderColor="#007BFF"
          borderWidth={1}
          borderRadius={8}
          paddingVertical={12}
          hoverStyle={{ backgroundColor: "#e6f0ff" }}
          marginTop={-10}
        >
          Sign up
        </Button>
      </Stack>
    </YStack>
  );
}
