import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface ItemProps {
  time: string;
  swinging?: string;
  elbowMovement?: string;
}

const DATA: ItemProps[] = [
  {
    time: "00:00.000-00:10.272",
    swinging: "00:10.232",
    elbowMovement: "00:09.221",
  },
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
    time: "00:31.102-00:42.103",
  },
];

const Item: React.FC<ItemProps & { index: number; onPress: () => void }> = ({
  index,
  time,
  swinging,
  elbowMovement,
  onPress,
}) => {
  const backgroundColor = swinging && elbowMovement ? "#ffcccc" : "#ccffcc";

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.item, { backgroundColor }]}>
        <Text style={styles.title}>{`Rep ${index + 1}`}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const OutputScreen: React.FC = () => {
  const router = useRouter();

  const handlePress = (item: ItemProps) => {
    router.push({
      pathname: "/rep-info/detail",
      params: {
        time: item.time,
        swinging: item.swinging,
        elbowMovement: item.elbowMovement,
      },
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={DATA}
          renderItem={({ item, index }) => (
            <Item
              index={index}
              time={item.time}
              swinging={item.swinging}
              elbowMovement={item.elbowMovement}
              onPress={() => handlePress(item)}
            />
          )}
          keyExtractor={(item) => item.time}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  time: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
});

export default OutputScreen;
