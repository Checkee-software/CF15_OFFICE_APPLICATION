import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatFileSize } from '@/screens/home/Document/utils/documentHelpers';

type FileRowProps = {
    name: string;
    size?: number;
    onRemove?: () => void;
};

const FileRow = React.memo(({ name, size, onRemove }: FileRowProps) => (
    <View style={styles.fileRow}>
        <View style={styles.fileLeft}>
            <MaterialCommunityIcons
                name='file-pdf-box'
                size={18}
                color='#FF5252'
            />
            <Text style={styles.fileName} numberOfLines={1}>
                {name}
            </Text>
        </View>
        <View style={styles.fileRight}>
            <Text style={styles.fileSize}>{formatFileSize(size)}</Text>
            {onRemove ? (
                <TouchableOpacity onPress={onRemove}>
                    <MaterialCommunityIcons
                        name='close'
                        size={18}
                        color='#9A9A9A'
                    />
                </TouchableOpacity>
            ) : null}
        </View>
    </View>
));

FileRow.displayName = 'FileRow';

const styles = StyleSheet.create({
    fileRow: {
        height: 40,
        backgroundColor: '#EFEFEF',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    fileName: { marginLeft: 8, color: '#4A4A4A', fontSize: 13, flex: 1 },
    fileRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    fileSize: { color: '#777', fontSize: 12 },
});

export default FileRow;
