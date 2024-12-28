// Loader.tsx
import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { Fold } from "react-native-animated-spinkit";

export default function Loader({ visible }: { visible: boolean }) {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <Fold size={50} color="#0000ff" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent overlay
  },
});
