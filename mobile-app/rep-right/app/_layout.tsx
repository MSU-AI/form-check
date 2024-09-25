import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { createTamagui, TamaguiProvider } from "tamagui";
import defaultConfig from "@tamagui/config/v3";

<<<<<<< HEAD
const config = createTamagui(defaultConfig);

import { useColorScheme } from "@/hooks/useColorScheme";
=======
import { useColorScheme } from '@/hooks/useColorScheme';
>>>>>>> 3231a86 (Added sign in page and connected firebase auth)

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
<<<<<<< HEAD
    <TamaguiProvider config={config}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="signin">
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          {/* <Stack.Screen name="forgot-password" options={{ headerShown: false }} /> TODO */}
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </TamaguiProvider>
=======
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName='signin'>
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
>>>>>>> 3231a86 (Added sign in page and connected firebase auth)
  );
}
