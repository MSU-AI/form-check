import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, Platform } from "react-native";

export default function HomeScreen() {
  return <Redirect href="/(app)/(tabs)/camera" />;
}
