import React, { useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export type myItemProps = {
  index?: number;
  starting: number;
  ending: number;
  bad_rep: boolean;
};

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
const Item: React.FC<myItemProps & { onPress: (item: any) => void }> = ({
  index,
  starting,
  ending,
  bad_rep,
  onPress,
}) => {
  const backgroundColor = bad_rep ? "#ffcccc" : "#ccffcc";

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.item, { backgroundColor }]}>
        <Text style={styles.title}>{`Rep ${index!}`}</Text>
        <Text style={styles.time}>
          {Math.round((ending - starting) * 100) / 100}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const OutputScreen: React.FC = () => {
  const router = useRouter();

  const handlePress = (item: any) => {
    router.push({
      pathname: "/rep-info/detail",
      params: {
        starting: item.starting,
        ending: item.ending,
        time: Math.round((item.ending - item.starting) * 100) / 100,
        bad_rep: item.bad_rep,
      },
    });
  };

  const params = useLocalSearchParams();
  const data = JSON.parse(params.data as string) as { [key: number]: myItemProps };
  const dataAsArr = convertToArray(data);

  // useEffect(() => { console.log(params); })

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={dataAsArr}
          renderItem={({ item }) => <Item {...item} onPress={() => { handlePress(item) }} />}
          keyExtractor={(item, index) => item.index!.toString()}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
