import {
    Modal,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator,
} from 'react-native';
import React from 'react';

interface BackdropProps {
    open: boolean;
    onClose?: () => void;
    opacity?: number;
    children?: React.ReactNode;
}

const Backdrop: React.FC<BackdropProps> = ({
    open,
    onClose,
    opacity = 0.5,
    children,
}) => {
    return (
        <Modal
            transparent
            animationType='fade'
            visible={open}
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View
                    style={[
                        styles.backdrop,
                        {backgroundColor: `rgba(0,0,0,${opacity})`},
                    ]}>
                    {children}
                    <ActivityIndicator size='large' color='white' />
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Backdrop;
