import React from "react";
import { View, FlatList, StyleSheet, Text, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

type ItemProps = { title: string };

const DATA = [
  // should probably just have {possibleErrors:string, DataArr} instead of defining everything
  {
    time: "00:00.000-00:10.272", // might need to make this a little less strict type checking
    swinging: "00:10.232",
    elbowMovement: "00:09.221",
  }, // representing each rep
  {
    time: "00:10.272-00:20.544",
    swinging: "00:10.232",
    elbowMovement: "00:09.221",
  },
  {
    time: "00:20.544-00:30.816",
    swinging: "00:10.232",
    elbowMovement: "00:09.221",
  },
  {
    time: "00:31.102-00:42.103", // no error example
  },
];

const Item = ({ time }: { time: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{time}</Text>
  </View>
);

const App = () => (
  <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={({ item }) => <Item time={item.time} />}
        keyExtractor={(item) => item.time}
      />
    </SafeAreaView>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});

export default App;
