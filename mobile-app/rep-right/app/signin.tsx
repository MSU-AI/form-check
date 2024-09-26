import React, { useState } from "react";
import { useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button, Input, YStack, Text, Stack } from "tamagui";
import { Image } from "react-native";

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
      router.replace("/(app)/(tabs)/explore");
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
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor="#2b2433"
      padding="$6"
      space="$4"
      paddingTop="$10"
    >
      <Stack id="logo" marginTop={40} space={20}>
        <Image
          source={require("../rep-right.png")}
          style={{ width: 300, height: 250, marginBottom: 10, marginTop: -30 }}
          resizeMode="contain"
        />
      </Stack>
      <Stack id="signin+box" margin={60} space={20}>
        <Text
          fontSize="$9"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          textAlign="center"
          marginBottom="$100"
          marginTop={-20}
        >
          Sign In
        </Text>
        <Stack
          width={300}
          padding="$4"
          backgroundColor="white"
          borderRadius="$9"
          shadowColor="rgba(0, 0, 0, 0.3)"
          shadowRadius={5}
          shadowOffset={{ width: 0, height: 10 }}
          shadowOpacity={0.2}
          space={9}
          marginTop={-1}
        >
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="$gray7"
            padding="$3"
            borderRadius="$4"
            borderColor="$borderColor"
            shadowColor="$shadowColor"
            shadowRadius={2}
            shadowOffset={{ width: 0, height: 2 }}
          />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="$gray7"
            secureTextEntry
            padding="$3"
            borderRadius="$4"
            borderColor="$borderColor"
            shadowColor="$shadowColor"
            shadowRadius={2}
            shadowOffset={{ width: 0, height: 2 }}
          />
          <Button
            onPress={handleSignIn}
            disabled={loading}
            backgroundColor="#876464"
            hoverStyle={{ backgroundColor: "#6f4f4f" }}
            color="white"
            shadowColor="$shadowColor"
            shadowRadius={2}
            shadowOffset={{ width: 0, height: 2 }}
            padding={3}
            borderRadius={4}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
          <Text marginTop={10} color="$gray10" textAlign="center">
            Don't have an account?
          </Text>
          <Button
            variant="outlined"
            onPress={() => router.replace("/signup")}
            color="$blue10"
            borderColor="$blue10"
            borderWidth={1}
            borderRadius="$4"
            hoverStyle={{ backgroundColor: "$blue2" }}
          >
            Sign up
          </Button>
        </Stack>
      </Stack>
    </YStack>
  );
}
