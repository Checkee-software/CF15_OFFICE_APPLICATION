import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles';
import {formatFileSize} from '../utils';

type FileRowProps = {
    name: string;
    size?: number;
    onRemove?: () => void;
};

const FileRow = React.memo(({name, size, onRemove}: FileRowProps) => (
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

export default FileRow;
