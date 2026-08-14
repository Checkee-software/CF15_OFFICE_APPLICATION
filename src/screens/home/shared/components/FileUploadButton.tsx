import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type FileUploadButtonProps = {
    label: string;
    iconColor: string;
    hasError?: boolean;
    onPress: () => void;
};

/**
 * Shared file upload/attach button with dashed border.
 * Used by IncomingFileSection and OutgoingFileSection.
 *
 * - signedFiles variant: green border (#9BD69E) + green bg (#EAF7EB)
 * - attachedFiles variant: orange border (#F3B260) + orange bg (#FFF3E6)
 *
 * The caller controls colors via `iconColor` and StyleSheet overrides via `style` prop.
 */
const FileUploadButton = React.memo(
    ({ label, iconColor, hasError = false, onPress }: FileUploadButtonProps) => (
        <TouchableOpacity
            style={[styles.uploadButton, hasError && styles.uploadButtonError]}
            onPress={onPress}>
            <View style={styles.uploadLeft}>
                <MaterialCommunityIcons
                    name='file-plus-outline'
                    size={17}
                    color='#333'
                />
                <Text style={styles.uploadText}>{label}</Text>
            </View>
            <MaterialCommunityIcons name='plus' size={20} color={iconColor} />
        </TouchableOpacity>
    ),
);

FileUploadButton.displayName = 'FileUploadButton';

const styles = StyleSheet.create({
    uploadButton: {
        minHeight: 40,
        borderWidth: 1,
        borderColor: '#BFBFBF',
        borderStyle: 'dashed',
        borderRadius: 6,
        backgroundColor: '#F5F5F5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    uploadButtonError: { borderColor: '#FF4D4F' },
    uploadLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 8,
    },
    uploadText: { fontSize: 13, color: '#555', flexShrink: 1 },
});

export default FileUploadButton;
