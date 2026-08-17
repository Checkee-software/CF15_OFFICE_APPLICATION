import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FileRow from './FileRow';
import type { TExistingFile, TPickedFile } from '../utils';

type IncomingFileSectionProps = {
    receiverLabel: string;
    errors: Record<string, any>;
    existingMainFiles: TExistingFile[];
    mainFilesNew: TPickedFile[];
    existingAttachedFiles: TExistingFile[];
    attachedFilesNew: TPickedFile[];
    canRemoveExistingMainFile: (file: TExistingFile) => boolean;
    handlePickMainFiles: () => void;
    handleRemoveExistingMainFile: (file: TExistingFile) => void;
    handleRemoveNewMainFile: (file: TPickedFile) => void;
    handlePickAttachedFiles: () => void;
    handleRemoveExistingAttachedFile: (file: TExistingFile) => void;
    handleRemoveNewAttachedFile: (file: TPickedFile) => void;
};

const IncomingFileSection = React.memo(
    ({
        receiverLabel,
        errors,
        existingMainFiles,
        mainFilesNew,
        existingAttachedFiles,
        attachedFilesNew,
        canRemoveExistingMainFile,
        handlePickMainFiles,
        handleRemoveExistingMainFile,
        handleRemoveNewMainFile,
        handlePickAttachedFiles,
        handleRemoveExistingAttachedFile,
        handleRemoveNewAttachedFile,
    }: IncomingFileSectionProps) => (
        <>
            {/* Receiver label */}
            <View style={styles.receiverRow}>
                <Text style={styles.receiverLabel}>Bộ phận tiếp nhận:</Text>
                <Text style={styles.receiverValue}>{receiverLabel}</Text>
            </View>

            {/* Main files (signed) */}
            <TouchableOpacity
                style={[
                    styles.uploadSign,
                    errors.mainFiles && styles.inputWrapError,
                ]}
                onPress={handlePickMainFiles}>
                <View style={styles.uploadLeft}>
                    <MaterialCommunityIcons
                        name="file-plus-outline"
                        size={17}
                        color="#333"
                    />
                    <Text style={styles.uploadSignText}>
                        Thêm văn bản trình ký (.pdf)
                    </Text>
                </View>
                <MaterialCommunityIcons name="plus" size={20} color="#4CAF50" />
            </TouchableOpacity>
            {!!errors.mainFiles && (
                <Text style={styles.fieldErrorLeft}>{errors.mainFiles}</Text>
            )}
            {existingMainFiles.map(file => (
                <View key={file.fileKey}>
                    <FileRow
                        name={file.originalname}
                        onRemove={
                            canRemoveExistingMainFile(file)
                                ? () => handleRemoveExistingMainFile(file)
                                : undefined
                        }
                    />
                </View>
            ))}
            {mainFilesNew.map(file => (
                <View key={`${file.uri}-${file.name}`}>
                    <FileRow
                        name={file.name}
                        size={file.size}
                        onRemove={() => handleRemoveNewMainFile(file)}
                    />
                </View>
            ))}

            {/* Attached files */}
            <TouchableOpacity
                style={[
                    styles.uploadAttach,
                    errors.attachedFiles && styles.inputWrapError,
                ]}
                onPress={handlePickAttachedFiles}>
                <View style={styles.uploadLeft}>
                    <MaterialCommunityIcons
                        name="file-plus-outline"
                        size={17}
                        color="#333"
                    />
                    <Text style={styles.uploadAttachText}>
                        Thêm văn bản đính kèm (.pdf)
                    </Text>
                </View>
                <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color="#FF9800"
                />
            </TouchableOpacity>
            {!!errors.attachedFiles && (
                <Text style={styles.fieldErrorLeft}>{errors.attachedFiles}</Text>
            )}
            {existingAttachedFiles.map(file => (
                <View key={file.fileKey}>
                    <FileRow
                        name={file.originalname}
                        onRemove={() => handleRemoveExistingAttachedFile(file)}
                    />
                </View>
            ))}
            {attachedFilesNew.map(file => (
                <View key={`${file.uri}-${file.name}`}>
                    <FileRow
                        name={file.name}
                        size={file.size}
                        onRemove={() => handleRemoveNewAttachedFile(file)}
                    />
                </View>
            ))}
        </>
    ),
);

IncomingFileSection.displayName = 'IncomingFileSection';

const styles = StyleSheet.create({
    receiverRow: {
        height: 34,
        borderRadius: 6,
        backgroundColor: '#E9E9E9',
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    receiverLabel: { fontSize: 13, color: '#8B8B8B' },
    receiverValue: { fontSize: 13, color: '#1E88E5', fontWeight: '500' },
    uploadSign: {
        minHeight: 40,
        borderWidth: 1,
        borderColor: '#9BD69E',
        borderStyle: 'dashed',
        borderRadius: 6,
        backgroundColor: '#EAF7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    uploadAttach: {
        minHeight: 40,
        borderWidth: 1,
        borderColor: '#F3B260',
        borderStyle: 'dashed',
        borderRadius: 6,
        backgroundColor: '#FFF3E6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    uploadLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 8,
    },
    uploadSignText: { fontSize: 13, color: '#555', flexShrink: 1 },
    uploadAttachText: { fontSize: 13, color: '#555', flexShrink: 1 },
    inputWrapError: { borderColor: '#FF4D4F' },
    fieldErrorLeft: {
        color: '#FF4D4F',
        fontSize: 12,
        marginTop: -4,
        marginBottom: 8,
        textAlign: 'left',
    },
});

export default IncomingFileSection;
