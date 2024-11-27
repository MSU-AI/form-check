import React, { useEffect, useRef } from "react";
import Loader from "../../../components/Loader";
import { useRouter } from "expo-router";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  Camera,
  CameraViewRef,
  PermissionResponse,
  useMicrophonePermissions,
} from "expo-camera";
import { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Button,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import axios, { AxiosError, spread } from "axios";
import "../../../firebaseConfig";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth, signOut } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { myItemProps } from "./rep-info/output";
import { useAtom } from 'jotai';
import * as jotaistates from '../../../state/jotaistates';
import { Stack } from "tamagui";


import { doc, getFirestore, setDoc } from "firebase/firestore";


// Get a reference to the storage service, which is used to create references in your storage bucket

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export default function CameraViewScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const cameraRef = useRef<CameraView>(null);
  // const [permissionMic, requestMicPermission] = Camera.useMicrophonePermissions();
  const [permissionMic, setPermissionMic] = useState<PermissionResponse | null>(
    null
  );
  // const [videoUri, setVideoUri] = useState<string | null>(null);

  const [videoUri, setVideoUri] = useAtom(jotaistates.videoLocationAtom);

  const router = useRouter();

  const handleRedirect = (data: any, videoName: string) => {
    console.log("Redirecting to output page with data: ", data);

    const uid = auth.currentUser ? auth.currentUser.uid : "UID";

    // Set document in Firestore
    setDoc(doc(db, "data", uid, "userdata", videoName), {
      videoName: videoName.slice(0, -4),  // Store trimmed video name as a field
      data: data,
    }).catch((error: any) => {
      console.log(error);
    });
    // router.replace
    router.push({
      pathname: "/(app)/(tabs)/rep-info/output",
      params: { data: JSON.stringify(data) }, // { data: data } satisfies { data: myItemProps },
    });
  };

  if (!permission || !microphonePermission) {
    // Only reject if all joints <0.8
    // Camera permissions are still loading.
    return <View />;
  }

  // useEffect(() => {
  //   async function getMicrophonePermissions() {
  //     const micPermission = await Camera.getMicrophonePermissionsAsync();
  //     if (!micPermission.granted) {
  //       const requestedMicPermission = await Camera.requestMicrophonePermissionsAsync();
  //       setPermissionMic(requestedMicPermission);
  //     } else {
  //       setPermissionMic(micPermission);
  //     }
  //   }

  //   getMicrophonePermissions();
  // }, []);

  if (!permission.granted || !microphonePermission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.containerForPerms}>
        <Stack id="logo" alignItems="center" marginBottom={20}>
          <Image
            source={require("../../../rep-right.png")}
            style={{ width: 300, height: 250 }}
            resizeMode="contain"
          />
        </Stack>
        <Text style={styles.message}>
          We need your permission to show the camera and access your microphone to record videos.
        </Text>
        <Text style={styles.message}>
          Note that if you denied permission once you will need to go to
          settings to enable it, and then restart the app.
        </Text>
        {(!permission.granted || (!microphonePermission.granted)) && (
          // <Button onPress={requestPermission} title="grant permission" />
          <Pressable style={({ pressed }) => [{ backgroundColor: pressed ? 'gray' : 'black' }, styles.grantPermissionsButton]} onPress={async () => { await requestPermission(); await Camera.requestMicrophonePermissionsAsync(); await requestMicrophonePermission(); }} >
            <Text style={styles.messageNoPadding}>
              Grant Permissions
            </Text>
          </Pressable>
        )}
        {/* {!permissionMic?.granted && (
          <Button onPress={async () => { await Camera.getMicrophonePermissionsAsync(); }} title="Grant Mic Perms" />
        )} */}
        {/* Example button */}
        {/* {!permissionMic!.granted && <Button onPress={async () => setPermissionMic(await Camera.requestMicrophonePermissionsAsync())} title="grant microphone permission" />} */}
      </View>
    );
  }

  async function toggleCameraFacing() {
    if (recording) {
      // important logic since recording stops if camera is flipped
      await toggleRecording();
    }
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function uploadVideo(uriOfFile: string): Promise<void> {
    if (!auth.currentUser) {
      alert("Please log in to upload videos");
      return; // shouldn't even get here
    }
    const videoName = `${new Date().getTime()}.mp4`;
    const storageRef = ref(
      storage,
      `videos/${auth.currentUser?.uid}/${videoName}`
    );
    try {
      const file = await fetch(uriOfFile);
      const blob = await file.blob();
      await uploadBytes(storageRef, blob).then((snapshot) => {
        console.log("Uploaded a blob or file!", snapshot);
        console.log(apiUrl);
      });
      // await fetch(`${apiUrl}/videos`, {})
      console.log(`${apiUrl}/process_video`);
      axios
        .get(`${apiUrl}/process_video`, {
          // TODO: need to test this, consider changing to POST, and deploy.
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          },
          params: { videoName: videoName }, // // videoName 'barbell_biceps_curl_15.mp4'  "1731126191737.mp4"
        })
        .then((response) => {
          setLoading(false);
          // console.log(response.data);
          if (!response.data['left'] || !response.data['right']) {
            if (!response.data['left'] && !response.data['right']) {
              alert("No reps found");
              return;
            }
            if (!response.data['left']) {
              handleRedirect(response.data['right'], videoName);
              return;
            }
            handleRedirect(response.data['left'], videoName);
            return;
          }
          let largerList: any = null;
          // if (response.data['left'] && !(response.data['right'] && Object.keys(response.data.left).length >=)) {
          //   largerList = response.data['left'];
          // }
          if (Object.keys(response.data['left']).length >= Object.keys(response.data['right']).length) {
            largerList = response.data['left'];
          }
          largerList = response.data['right'];
          handleRedirect(largerList, videoName);


          // if (!response.data['left'] || Object.keys(response.data.left).length === 0) {
          //   alert("No reps found");
          //   return;
          // }
          // handleRedirect(response.data);
        })
        .catch((error: AxiosError) => {
          console.log("Error: ", error.cause, error.code);
          alert(
            "An error occurred contacting the server, please try again later"
          );
        });

      // fetch(uriOfFile).then((response) => {
      //   response.blob().then((blob) => {
      //     uploadBytes(storageRef, blob).then((snapshot) => {
      //       console.log('Uploaded a blob or file!');
      //     }).catch((error) => {
      //       console.log(error, 'Something went wrong!');
      //     });
      //   })
      // })
    } catch (error) {
      console.log(error);
      alert("An error occured in the uploadVideo function");
    }
  }

  async function toggleRecording(): Promise<void> {
    const micPerms = await Camera.getMicrophonePermissionsAsync();
    if (!micPerms.granted) {
      alert("Please allow microphone permissions in settings");
      await Camera.requestMicrophonePermissionsAsync();
      return;
    }
    if (!cameraRef.current) {
      alert("Camera is not ready");
      return;
    }
    if (!recording) {
      cameraRef.current?.recordAsync().then((response) => {
        setLoading(true);
        console.log("is response", response);
        if (response && response.uri) {
          setVideoUri(response.uri);
          // Create a storage reference from our storage service
          uploadVideo(response.uri);
        }
      });
      setRecording(true);
    } else {
      cameraRef.current?.stopRecording();
      setRecording(false);
    }
  }

  // note - to make this work the container mode needs to be video https://stackoverflow.com/a/78468971 https://stackoverflow.com/questions/78468927/expo-51-camera-recording-was-stopped-before-any-data-could-be-produced/78468971#78468971
  return (
    <View style={{ ...styles.blackBackground, ...styles.container }}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <CameraView
          mode="video"
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        />
        <Pressable onPress={() => signOut(auth)} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Log Out</Text>
        </Pressable>

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={toggleCameraFacing} style={styles.button}>
            <Ionicons name="camera-reverse-outline" size={50} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleRecording}
            style={styles.recordButton}
          >
            <Ionicons
              name={recording ? "square" : "radio-button-on-outline"}
              size={50}
              color={recording ? "red" : "white"}
            />
          </TouchableOpacity>
        </View>
        <Loader visible={loading} />
      </SafeAreaView>
    </View>
  );
}

//{/* What this should do if when it starts recording change to a stop icon */}

const styles = StyleSheet.create({
  containerForPerms: {
    flex: 1,
    backgroundColor: "#2b2433",
    justifyContent: "center",
  },
  blackBackground: {
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
  },
  messageNoPadding: {
    textAlign: "center",
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    alignItems: "center",
  },
  recordButton: {
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  signOutButton: {
    position: "absolute",
    top: 75,
    right: 10,
    backgroundColor: "black",
    padding: 12,
    // margin: 10,
    borderRadius: 10,
  },
  signOutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    top: 0,
    right: 0,
  },
  grantPermissionsButton: {
    // backgroundColor: "black",
    padding: 12,
    margin: 10,
    borderRadius: 10,
  },
});
