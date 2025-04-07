import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Splash() {
    return (
        <View style={styles.container}>
            <Text>Hello world, splash</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
