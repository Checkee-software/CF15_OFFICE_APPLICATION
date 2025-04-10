import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Loading() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#339CFF" />
            <Text style={styles.text}>Đang tải dữ liệu...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    }
});
