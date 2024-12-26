import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import * as WebBrowser from 'expo-web-browser';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;


export default function FeedbackTab() {
    const _handlePress = async () => {
        await WebBrowser.openBrowserAsync('https://forms.gle/bMKnhj9NMg6iU8v67'); // expo env var to show feedback form
        console.log(height, width);
    };

    return (
        <View style={styles.feedbackTab}>
            <TouchableOpacity onPress={_handlePress} style={styles.feedbackButton}>
                <Text style={styles.feedbackText}>Feedback</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedbackTab: {
        position: 'absolute',
        left: 0, // Position it at the very left edge
        top: height * 0.45, // Center vertically on the screen
        // bottom: '45%',
        transform: [{ translateY: -50 }], // Adjust to align the center of the button
        zIndex: 1000,
    },
    feedbackButton: {
        backgroundColor: '#007bff',
        // height: 120, // Ensure the button tightly wraps the text
        height: height * 0.1,
        width: (height * 40 / 928), // Narrow width to minimize space
        justifyContent: 'center', // Center the rotated text
        alignItems: 'center',
        borderRadius: 5, // Optional: rounded edges for better appearance
    },
    feedbackText: {
        // height: 120,
        // width: ,
        width: (height * 70 / 928),
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        transform: [{ rotate: '-90deg' }], // Rotate text vertically
        fontSize: height * 14 / 928, // Adjust font size for a clean fit
    },
});
