// app/rep-info/detail.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const DetailScreen = () => {
  const { starting, ending, bad_rep, time } = useLocalSearchParams();

  /**
   *       {swinging && <Text style={styles.detail}>Swinging: {swinging}</Text>}
    {elbowMovement && (
        <Text style={styles.detail}>Elbow Movement: {elbowMovement}</Text>
      )}
        Just using avg for now 
   */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time: {time}</Text>

      {bad_rep ?
        <Text style={styles.detail}>Bad Rep at time {Math.round((parseFloat(starting as string) + parseFloat(time as string) / 2) * 100) / 100}</Text>
        :
        <Text style={styles.detail}>Good Rep!</Text>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: 'white',
  },
  title: { fontSize: 24, fontWeight: "bold" },
  detail: { fontSize: 18, marginTop: 10, color: "gray" },
});

export default DetailScreen;
