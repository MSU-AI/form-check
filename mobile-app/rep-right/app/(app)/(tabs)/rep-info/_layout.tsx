import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";

export default function RepInfoLayout() {
  return (
    <Stack initialRouteName="output">
      <Stack.Screen name="output" options={{ headerShown: false }} />
      <Stack.Screen name="detail" options={{ headerShown: false }} />
    </Stack>
  );
}
