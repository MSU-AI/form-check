import React, { useEffect, useRef } from "react";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  Camera,
  CameraViewRef,
  PermissionResponse,
} from "expo-camera";
import { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as FileSystem from "expo-file-system";
import {
  Button,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios, { AxiosError } from "axios";
import "../../../firebaseConfig";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth, signOut } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

// Get a reference to the storage service, which is used to create references in your storage bucket

const auth = getAuth();
const storage = getStorage();

export default function CameraViewScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [recording, setRecording] = useState(false);
  // const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const cameraRef = useRef<CameraView>(null);
  // const [permissionMic, requestMicPermission] = Camera.useMicrophonePermissions();
  const [permissionMic, setPermissionMic] = useState<PermissionResponse | null>(
    null
  );
  const [videoUri, setVideoUri] = useState<string | null>(null);

  if (!permission) {
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

  if (!permission.granted || (permissionMic && !permissionMic.granted)) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera.
        </Text>
        <Text style={styles.message}>
          Note that if you denied permission once you will need to go to
          settings to enable it, and then restart the app.
        </Text>

        {!permission.granted && (
          <Button onPress={requestPermission} title="grant permission" />
        )}
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
          params: { videoName: videoName },
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error: AxiosError) => {
          console.log("Error: ", error.cause, error.code);
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
    <SafeAreaView style={styles.container}>
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
        <TouchableOpacity onPress={toggleRecording} style={styles.recordButton}>
          <Ionicons
            name={recording ? "square" : "radio-button-on-outline"}
            size={50}
            color={recording ? "red" : "white"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//{/* What this should do if when it starts recording change to a stop icon */}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
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
    top: 200,
    right: 0,
  },
  signOutButtonText: {
    color: "white",
    fontSize: 20,
    top: 20,
    right: 0,
  },
});
