import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FileRow from '../../shared/components/FileRow';
import type { TExistingFile, TPickedFile } from '../../shared/utils/fileHelpers';

type OutgoingFileSectionProps = {
    creatorDeptName: string;
    selectedReceiveDeptName: string;
    errors: Record<string, any>;
    existingSignedFiles: TExistingFile[];
    signedFilesNew: TPickedFile[];
    existingAttachedFiles: TExistingFile[];
    attachedFilesNew: TPickedFile[];
    handlePickSignedFiles: () => void;
    handleRemoveExistingSignedFile: (file: TExistingFile) => void;
    setSignedFilesNew: React.Dispatch<React.SetStateAction<TPickedFile[]>>;
    handlePickAttachedFiles: () => void;
    handleRemoveExistingAttachedFile: (file: TExistingFile) => void;
    setAttachedFilesNew: React.Dispatch<React.SetStateAction<TPickedFile[]>>;
};

const OutgoingFileSection = React.memo(({
    creatorDeptName,
    selectedReceiveDeptName,
    errors,
    existingSignedFiles,
    signedFilesNew,
    existingAttachedFiles,
    attachedFilesNew,
    handlePickSignedFiles,
    handleRemoveExistingSignedFile,
    setSignedFilesNew,
    handlePickAttachedFiles,
    handleRemoveExistingAttachedFile,
    setAttachedFilesNew,
}: OutgoingFileSectionProps) => (
    <>
        {/* Bộ phận tiếp nhận info */}
        <View style={styles.receiverRow}>
            <Text style={styles.receiverLabel}>Bộ phận tiếp nhận:</Text>
            <Text style={styles.receiverValue}>{selectedReceiveDeptName || creatorDeptName}</Text>
        </View>

        {/* Signed files */}
        <TouchableOpacity
            style={[styles.uploadSign, errors.signedFiles && styles.inputWrapError]}
            onPress={handlePickSignedFiles}>
            <View style={styles.uploadLeft}>
                <MaterialCommunityIcons name="file-plus-outline" size={17} color="#333" />
                <Text style={styles.uploadSignText}>Thêm văn bản trình ký (.pdf)</Text>
            </View>
            <MaterialCommunityIcons name="plus" size={20} color="#4CAF50" />
        </TouchableOpacity>
        {!!errors.signedFiles && <Text style={styles.fieldErrorLeft}>{errors.signedFiles}</Text>}

        {existingSignedFiles.map(file => (
            <View key={file.fileKey}>
                <FileRow
                    name={file.originalname}
                    onRemove={() => handleRemoveExistingSignedFile(file)}
                />
            </View>
        ))}
        {signedFilesNew.map(file => (
            <View key={`${file.uri}-${file.name}`}>
                <FileRow
                    name={file.name}
                    size={file.size}
                    onRemove={() => setSignedFilesNew(prev => prev.filter(i => i.uri !== file.uri))}
                />
            </View>
        ))}

        {/* Attached files */}
        <TouchableOpacity style={styles.uploadAttach} onPress={handlePickAttachedFiles}>
            <View style={styles.uploadLeft}>
                <MaterialCommunityIcons name="file-plus-outline" size={17} color="#333" />
                <Text style={styles.uploadAttachText}>
                    {attachedFilesNew.length > 0 ? `Đã chọn ${attachedFilesNew.length} file đính kèm` : 'Thêm văn bản đính kèm (.pdf)'}
                </Text>
            </View>
            <MaterialCommunityIcons name="plus" size={20} color="#FF9800" />
        </TouchableOpacity>
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
                    onRemove={() => setAttachedFilesNew(prev => prev.filter(i => i.uri !== file.uri))}
                />
            </View>
        ))}
    </>
));

OutgoingFileSection.displayName = 'OutgoingFileSection';

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
    uploadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
    uploadSignText: { fontSize: 13, color: '#555', flexShrink: 1 },
    uploadAttachText: { fontSize: 13, color: '#555', flexShrink: 1 },
    inputWrapError: { borderColor: '#FF4D4F' },
    fieldErrorLeft: { color: '#FF4D4F', fontSize: 12, marginTop: -4, marginBottom: 8, textAlign: 'left' },
});

export default OutgoingFileSection;
