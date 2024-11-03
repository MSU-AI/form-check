// app/rep-info/detail.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const DetailScreen = () => {
  const { time, swinging, elbowMovement } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time: {time}</Text>
      {swinging && <Text style={styles.detail}>Swinging: {swinging}</Text>}
      {elbowMovement && (
        <Text style={styles.detail}>Elbow Movement: {elbowMovement}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  detail: { fontSize: 18, marginTop: 10, color: "gray" },
});

export default DetailScreen;
