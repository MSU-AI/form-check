import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import "../../firebaseConfig";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";

export default function AppLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const auth = getAuth();
  useEffect(() => {
    // onAuthStateChanged(auth, setUser);
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log(user);
      if (user) {
        // console.log("HERE!");
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  if (user === undefined) {
    // Optionally, return a loading indicator here
    return null;
  }
  // useEffect(() => {
  // }, [user]);
  // Can also keep the splash screen open until the user is loaded.
  // if (user === null) {
  //     return <Redirect href='/signin' />;
  // }

  return (
    <>
      {user ? (
        <Stack initialRouteName="(tabs)">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <Redirect href="/signin" />
      )}
    </>
  );
}
