import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import styles from '../styles/styles';

type TMySignOverlayProps = {
    visible: boolean;
    message: string;
};

const MySignOverlay = ({visible, message}: TMySignOverlayProps) => {
    if (!visible) {
        return null;
    }

    return (
        <View style={styles.mySignPendingOverlay}>
            <View style={styles.mySignPendingCard}>
                <ActivityIndicator size='large' color='#4CAF50' />
                <Text style={styles.mySignPendingText}>{message}</Text>
            </View>
        </View>
    );
};

export default MySignOverlay;
