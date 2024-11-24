import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { config } from "@tamagui/config/v3";

import { Provider as JotaiProvider } from "jotai";

const appConfig = createTamagui(config);

// TypeScript types across all Tamagui APIs
// type Conf = typeof tamaguiConfig
// declare module '@tamagui/core' {
//   interface TamaguiCustomConfig extends Conf { }
// }

import { useColorScheme } from "@/hooks/useColorScheme";
import FeedbackTab from "@/components/FeedbackTab";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Inter: require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"), // necessary for Tamagui
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <JotaiProvider>
      <TamaguiProvider config={appConfig}>
        <ThemeProvider value={DarkTheme}>
          <Stack initialRouteName="signin">
            <Stack.Screen name="signin" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            {/* <Stack.Screen name="forgot-password" options={{ headerShown: false }} /> TODO */}
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <FeedbackTab />
        </ThemeProvider>
      </TamaguiProvider>
    </JotaiProvider>
  );
}
