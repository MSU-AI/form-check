import React, { useEffect } from "react";
import * as Animatable from "react-native-animatable";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

export type myItemProps = {
  index?: number;
  starting_time: number;
  ending_time: number;
  errors: string[];
};

const { height } = Dimensions.get("window"); // Get screen height
const CARD_HEIGHT = height / 4; // Divide screen height into 4 equal parts

const convertToArray = (itemList: { [key: number]: myItemProps }) => {
  const out: myItemProps[] = [];
  for (let key of Object.keys(itemList)) {
    out.push({ ...itemList[parseInt(key)], index: parseInt(key) });
  }
  return out;
};

// const DATA: ItemProps[] = [
//   {
//     time: "00:00.000-00:10.272",
//     swinging: "00:10.232",
//     elbowMovement: "00:09.221",
//   },
//   {
//     time: "00:10.272-00:20.544",
//     swinging: "00:10.232",
//     elbowMovement: "00:09.221",
//   },
//   {
//     time: "00:20.544-00:30.816",
//     swinging: "00:10.232",
//     elbowMovement: "00:09.221",
//   },
//   {
//     time: "00:31.102-00:42.103",
//   },
// ];

// myItemProps & { index: number; onPress: () => void }
const Item: React.FC<
  myItemProps & { onPress: (item: any) => void; animation: string }
> = ({ index, starting_time, ending_time, errors, onPress, animation }) => {
  const backgroundColor = errors.length != 0 ? "#ffcccc" : "#ccffcc";
  console.log(errors);

  return (
    <Animatable.View animation={animation} duration={1000}>
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.item, { backgroundColor }]}>
          <Text style={styles.title}>{`Rep ${index!}`}</Text>
          <Text style={styles.time}>
            {Math.round((ending_time - starting_time) * 100) / 100}
          </Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const OutputScreen: React.FC = () => {
  const router = useRouter();

  const handlePress = (item: any) => {
    router.push({
      pathname: "/rep-info/detail",
      params: {
        starting: item.starting_time,
        ending: item.ending_time,
        time: Math.round((item.ending_time - item.starting_time) * 100) / 100,
        errors: item.errors,
      },
    });
  };

  const params = useLocalSearchParams();

  //PUT THIS BACK FOR PRODUCTION
  const data = JSON.parse(params.data as string) as {
    [key: number]: myItemProps;
  };
  //PUT THIS BACK FOR PRODUCTION

  // FOR TESTING ONLY
  // const defaultData = {
  //   0: { starting: 0.0, ending: 0.03, bad_rep: false },
  //   1: { starting: 0.03, ending: 0.1, bad_rep: true },
  //   2: { starting: 0.1, ending: 0.47, bad_rep: false },
  //   3: { starting: 0.47, ending: 0.67, bad_rep: false },
  // };
  // const data = params.data ? JSON.parse(params.data as string) : defaultData;
  //FOR TESTING ONLY

  const dataAsArr = convertToArray(data);

  // useEffect(() => { console.log(params); })

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={dataAsArr}
          renderItem={({ item, index }) => (
            <Item
              {...item}
              animation={index % 2 === 0 ? "slideInLeft" : "slideInRight"}
              onPress={() => {
                handlePress(item);
              }}
            />
          )}
          keyExtractor={(item, index) => item.index!.toString()}
        />
        <Pressable
          style={styles.floatingActionButtonBottomLeft}
          onPress={() => {
            router.back();
          }}>
          <Ionicons
            name={/*"return-up-back"*/ "arrow-back"}
            size={50}
            color={"black"}
          />
        </Pressable>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#302736",
  },
  item: {
    height: CARD_HEIGHT,
    padding: 20,
    marginVertical: 24,
    marginHorizontal: 29,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android only
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1 }],
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
  floatingActionButtonBottomLeft: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
  },
});

export default OutputScreen;
