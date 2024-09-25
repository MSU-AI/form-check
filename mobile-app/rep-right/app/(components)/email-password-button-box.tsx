import { View, TextInput, Button, StyleSheet, Text } from "react-native";


export default function EmailPasswordButtonBox(props: { email: string, setEmail: (email: string) => void, password: string, setPassword: (password: string) => void, loading: boolean, handleSignIn: () => Promise<void>, buttonText: string }) {
    return (
        <>
            < TextInput
                style={[styles.inputs, styles.topBoxStyle]}
                onChangeText={props.setEmail}
                value={props.email}
                placeholder="Email"
            />
            <TextInput
                style={[styles.inputs, styles.bottomBoxStyle]}
                onChangeText={props.setPassword}
                value={props.password}
                secureTextEntry
                placeholder="Password"
            />
            <Button title={props.buttonText} onPress={props.handleSignIn} disabled={props.loading} />
        </>
    );
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
});
