import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

type IncomingFormHeaderProps = {
    formMode: 'CREATE' | 'LAYOUT_1' | 'LAYOUT_3' | 'LAYOUT_4';
    onClose: () => void;
};

const IncomingFormHeader = React.memo(
    ({ formMode, onClose }: IncomingFormHeaderProps) => {
        const title =
            formMode === 'CREATE' ? 'Tạo văn bản đến' : 'Cập nhật văn bản đến';
        return (
            <View style={styles.createHeader}>
                <Text style={styles.createTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.createReset}>Đóng lại</Text>
                </TouchableOpacity>
            </View>
        );
    },
);

IncomingFormHeader.displayName = 'IncomingFormHeader';

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

export default IncomingFormHeader;
