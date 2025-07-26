import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Error(props: any) {
    return (
        <View style={styles.container}>
            <Text>{props.detail}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
