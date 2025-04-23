import React from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import images from '../../../assets/images';

export default function Loading() {
    const spinValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2200,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.Image
                source={images.logoCF15}
                style={[styles.image, {transform: [{rotate: spin}]}]}
                resizeMode='contain'
            />
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
    image: {
        width: 80,
        height: 80,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});
