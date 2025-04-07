import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Error() {
    return (
        <View style={styles.container}>
            <Text>Hello world error</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'pink',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
