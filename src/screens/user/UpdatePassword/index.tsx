import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UpdatePassword() {
    return (
        <View style={styles.container}>
            <Text>Hello world</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
});
