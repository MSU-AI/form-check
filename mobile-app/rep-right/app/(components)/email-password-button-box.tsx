import React from "react";
import { Button, Input, YStack, Text } from "tamagui";

export default function EmailPasswordButtonBox(props: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  handleSignIn: () => Promise<void>;
  buttonText: string;
}) {
  return (
    <YStack
      space
      padding="$4"
      width={250}
      backgroundColor="$background"
      borderRadius="$4"
      shadowColor="$shadowColor"
      elevation="$4"
    >
      <Text
        fontSize="$6"
        color="$color"
        fontWeight="bold"
        textAlign="center"
        marginBottom="$2"
      >
        Sign In
      </Text>
      <Input
        value={props.email}
        onChangeText={props.setEmail}
        placeholder="Email"
        padding="$3"
        borderRadius="$4"
        shadowColor="$shadowColor"
        elevation={1}
        borderColor="$borderColor"
        fontFamily="$body"
        placeholderTextColor="$colorLight"
      />
      <Input
        value={props.password}
        onChangeText={props.setPassword}
        secureTextEntry
        placeholder="Password"
        padding="$3"
        borderRadius="$4"
        shadowColor="$shadowColor"
        elevation={1}
        borderColor="$borderColor"
        fontFamily="$body"
        placeholderTextColor="$colorLight"
        marginBottom="$4"
      />
      <Button
        onPress={props.handleSignIn}
        disabled={props.loading}
        backgroundColor="$blue10"
        hoverStyle={{ backgroundColor: "$blue9" }}
        fontFamily="$body"
        color="white"
        shadowColor="$shadowColor"
        elevation="$2"
        padding="$3"
        borderRadius="$4"
      >
        {props.loading ? "Signing In..." : props.buttonText}
      </Button>
    </YStack>
  );
}
