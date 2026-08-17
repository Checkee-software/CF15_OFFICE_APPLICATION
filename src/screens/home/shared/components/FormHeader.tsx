import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FormHeaderProps = {
    title: string;
    closeLabel?: string;
    onClose: () => void;
};

/**
 * Shared form header with title + close button.
 * Used by IncomingForm and OutgoingForm.
 */
const FormHeader = React.memo(
    ({ title, closeLabel = 'Đóng lại', onClose }: FormHeaderProps) => (
        <View style={styles.createHeader}>
            <Text style={styles.createTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
                <Text style={styles.createReset}>{closeLabel}</Text>
            </TouchableOpacity>
        </View>
    ),
);

FormHeader.displayName = 'FormHeader';

const styles = StyleSheet.create({
    createHeader: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#DBDBDB',
        marginHorizontal: -12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    createTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#161616',
        flex: 1,
        marginRight: 12,
    },
    createReset: { fontSize: 13, color: '#66BB6A' },
});

export default FormHeader;
