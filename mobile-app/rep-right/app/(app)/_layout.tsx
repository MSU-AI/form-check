import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import "../../firebaseConfig";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";

export default function AppLayout() {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, [])
  // Can also keep the splash screen open until the user is loaded.
  if (user === null) {
    return <Redirect href='/signin' />;
  }

  return (
    <Stack>
      <Stack.Screen name='(app)' />
    </Stack>
  );
}
