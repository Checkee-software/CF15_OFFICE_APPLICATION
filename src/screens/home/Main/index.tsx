import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Main() {
    return (
        <View style={styles.container}>
            <Text>Hello world</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
