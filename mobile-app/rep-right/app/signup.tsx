import { useState } from 'react';
import { Button, TextInput, View, StyleSheet, Image, Text, Pressable } from 'react-native';
import EmailPasswordButtonBox from './(components)/email-password-button-box';
import { router } from 'expo-router';

export default function SignUpScreen() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSignUp(): Promise<void> {
        setLoading(true)

        // placeholder to make it load for a second
        setTimeout(() => setLoading(false), 1000);
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
