import { useState } from 'react';
import { Button, TextInput, View, StyleSheet, Image, Text, Pressable } from 'react-native';
import EmailPasswordButtonBox from './(components)/email-password-button-box';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

export default function SignUpScreen() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    async function handleSignUp(): Promise<void> {
        setLoading(true)
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                // ...
                router.replace('/(app)');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
                alert(`Error code ${errorCode}: ${errorMessage}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <View style={styles.mainViewStyle}>
            {/* <Image
                source={require('../assets/images/icon.png')}
                style={{ width: 80, height: 80 }} /> */}
            <Text style={styles.signUpTextStyle}>Sign Up</Text>
            <EmailPasswordButtonBox email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} handleSignIn={handleSignUp} buttonText='Sign Up' />
            <Pressable style={styles.signInButtonStyle} onPress={() => { router.replace('/signin') }}>
                <Text style={{ color: 'blue' }}>Sign In</Text>
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
    signUpTextStyle: {
        fontSize: 20,
        marginBottom: 20,
    },
    signInButtonStyle: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: 'blue',
        backgroundColor: 'transparent',
    }
});
