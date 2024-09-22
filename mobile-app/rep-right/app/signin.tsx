import { useState } from 'react';
import { Button, TextInput, View, StyleSheet, Image, Text } from 'react-native';

export default function SignInScreen() {
    return (
        <View style={styles.mainViewStyle}>
            <Text>Sign in</Text>
        </View>
    );
    // return (
    //     <View
    //         style={styles.mainViewStyle}
    //     // className="flex justify-center items-center"
    //     >
    //         <Image
    //             source={require('../assets/images/icon.png')}
    //             style={{ width: 80, height: 80 }} />
    //         < TextInput
    //             style={[styles.inputs, styles.topBoxStyle]}
    //             onChangeText={setEmail}
    //             value={email}
    //             placeholder="Email"
    //         />
    //         <TextInput
    //             style={[styles.inputs, styles.bottomBoxStyle]}
    //             onChangeText={setPassword}
    //             value={password}
    //             secureTextEntry
    //             placeholder="Password"
    //         />
    //         <Button title="Sign In" onPress={handleSignIn} disabled={loading} />
    //     </View>
    // );
}


const styles = StyleSheet.create({
    inputs: {
        height: 40,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 7,
    },
    topBoxStyle: {
        marginBottom: 10,
    },
    bottomBoxStyle: {
        marginBottom: 20,
    },
    mainViewStyle: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
    },
});
