// app/rep-info/detail.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as jotaistates from '../../../../state/jotaistates';
import { useAtom } from 'jotai';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from "expo";
import Ionicons from "react-native-vector-icons/Ionicons";

const DetailScreen = () => {
  const { starting, ending, bad_rep, time } = useLocalSearchParams();

  const [videoUri, setVideoUri] = useAtom(jotaistates.videoLocationAtom);


  // useEffect(() => {

  // }, []);
  const player = useVideoPlayer(videoUri, player => {
    player.loop = true;
    player.play();
    player.muted = true;
    // player.currentTime = 0.5;//start time
    player.currentTime = parseFloat(starting as string);
  });

  // const { currentTime } = useEvent(player, 'timeUpdate', {
  //   currentTime: player.currentTime,
  //   currentLiveTimestamp: player.currentLiveTimestamp, // or appropriate value
  //   currentOffsetFromLive: player.currentOffsetFromLive, // or appropriate value
  //   bufferedPosition: player.bufferedPosition // or appropriate value
  // });

  const [currTime, setCurrTime] = useState(0);

  useEffect(() => {
    if (player.currentTime >= parseFloat(ending as string)) {
      player.currentTime = parseFloat(starting as string);
    }
    setCurrTime(player.currentTime);
    console.log('here');
  }, [player.currentTime]);


  /**
   *       {swinging && <Text style={styles.detail}>Swinging: {swinging}</Text>}
    {elbowMovement && (
        <Text style={styles.detail}>Elbow Movement: {elbowMovement}</Text>
      )}
        Just using avg for now 
   */
  return (
    <View style={styles.enclosingContainer}>
      <SafeAreaView style={styles.container}>
        {/* <Text style={styles.title}>Time: {time}</Text> */}
        {/* <Text>{videoUri}</Text> */}
        <VideoView style={styles.video} player={player} nativeControls={false} allowsFullscreen allowsPictureInPicture />
        <View style={styles.badOrGoodRep}>
          {bad_rep == 'true' ?
            <Text>Bad Rep at time {Math.round((parseFloat(starting as string) + parseFloat(time as string) / 2) * 100) / 100}</Text>
            :
            <Text>Good Rep!</Text>
          }
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    // padding: 20,
    backgroundColor: "#302736",
  },
  video: {
    // width: 350,
    alignSelf: "stretch",
    // left: 0,
    // right: 0,
    height: 375, //275,
    backgroundColor: "black",
  },
  floatingActionButtonBottomLeft: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
  },
  enclosingContainer: {
    flex: 1,
    backgroundColor: "#302736",
  },
  badOrGoodRep: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "white",
    // height: 50,
    alignSelf: 'stretch',
    alignContent: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: "bold" },
  detail: { fontSize: 18, marginTop: 10, color: "gray" },
});

export default DetailScreen;
