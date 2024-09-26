import { useState } from 'react';
import { TextInput, View, StyleSheet, Image, Text, TouchableOpacity, Pressable } from 'react-native';
import EmailPasswordButtonBox from './(components)/email-password-button-box';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { Button } from 'tamagui';

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    async function handleSignIn(): Promise<void> {
        setLoading(true)
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
        // placeholder to make it load for a seocnd
        setTimeout(() => setLoading(false), 1000);
    }

    return (
        <View style={styles.mainViewStyle}>
            {/* <Image
                source={require('../assets/images/icon.png')}
                style={{ width: 80, height: 80 }} /> */}
            <Text style={styles.signInTextStyle}>Sign In</Text>
            <EmailPasswordButtonBox email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} handleSignIn={handleSignIn} buttonText='Sign In' />
            {/* <Button style={styles.signUpButtonStyle} title='Sign Up' onPress={() => { router.replace('/signup') }} /> */}
            {/* Example tamagui button: <Button size="$3" theme="active">
                Active
            </Button> */}
            <Pressable style={styles.signUpButtonStyle} onPress={() => { router.replace('/signup') }}>
                <Text style={{ color: 'blue' }}>Sign Up</Text>
            </Pressable>
        </View>
    );
}


const styles = StyleSheet.create({
    mainViewStyle: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
    },
    signInTextStyle: {
        fontSize: 20,
        marginBottom: 20,
    },
    signUpButtonStyle: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: 'blue',
        backgroundColor: 'transparent',
    }
});
