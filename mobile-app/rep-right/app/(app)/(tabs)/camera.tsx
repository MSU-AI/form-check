import React, { useEffect, useRef } from "react";
import { CameraView, CameraType, useCameraPermissions, Camera, CameraViewRef, PermissionResponse } from "expo-camera";
import { useState } from "react";
import { Button, GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { processVideoAsync } from "@/modules/pose-detection-video";

export default function CameraViewScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [recording, setRecording] = useState(false);
  // const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const cameraRef = useRef<CameraView>(null);
  // const [permissionMic, requestMicPermission] = Camera.useMicrophonePermissions();
  const [permissionMic, setPermissionMic] = useState<PermissionResponse | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  if (!permission) { // Only reject if all joints <0.8
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
          Note that if you denied permission once you will need to go to settings to enable it, and then restart the app.
        </Text>

        {!permission.granted && <Button onPress={requestPermission} title="grant permission" />}
        {/* {!permissionMic!.granted && <Button onPress={async () => setPermissionMic(await Camera.requestMicrophonePermissionsAsync())} title="grant microphone permission" />} */}
      </View>
    );
  }

  async function toggleCameraFacing() {
    if (recording) { // important logic since recording stops if camera is flipped
      await toggleRecording();
    }
    setFacing((current) => (current === "back" ? "front" : "back"));
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
        }
      });
      setRecording(true);
    }
    else {
      cameraRef.current?.stopRecording();
      setRecording(false);
    }
  }

  // note - to make this work the container mode needs to be video https://stackoverflow.com/a/78468971 https://stackoverflow.com/questions/78468927/expo-51-camera-recording-was-stopped-before-any-data-could-be-produced/78468971#78468971
  return (
    <View style={styles.container}>
      <CameraView mode="video" style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordButton} onPress={toggleRecording}>
            <Text style={styles.text}>{recording ? "Stop recording" : "Start Recording"}</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
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
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  recordButton: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
