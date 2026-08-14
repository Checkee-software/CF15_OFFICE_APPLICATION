import { useState } from 'react';
import { Alert } from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import type { TExistingFile, TPickedFile } from '../../shared/utils/fileHelpers';

export const useOutgoingFiles = () => {
    const [signedFilesNew, setSignedFilesNew] = useState<TPickedFile[]>([]);
    const [attachedFilesNew, setAttachedFilesNew] = useState<TPickedFile[]>([]);
    const [existingSignedFiles, setExistingSignedFiles] = useState<TExistingFile[]>([]);
    const [existingAttachedFiles, setExistingAttachedFiles] = useState<TExistingFile[]>([]);
    const [signedFilesToRemove, setSignedFilesToRemove] = useState<string[]>([]);
    const [attachedFilesToRemove, setAttachedFilesToRemove] = useState<string[]>([]);
    const [mainFilesToRemove, setMainFilesToRemove] = useState<string[]>([]);

    const handlePickSignedFiles = async () => {
        try {
            const result = await pick({
                type: [types.pdf],
                allowMultiSelection: true,
            });
            const mapped = result.map((f: any) => ({
                uri: f.uri,
                name: f.name || `signed-${Date.now()}.pdf`,
                type: f.type || 'application/pdf',
                size: f.size,
            }));
            setSignedFilesNew(prev => [...prev, ...mapped]);
        } catch (e: any) {
            if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) { return; }
            Alert.alert('Lỗi chọn file', 'Thiếu module chọn file trong bản build hiện tại. Vui lòng build lại ứng dụng.');
        }
    };

    const handlePickAttachedFiles = async () => {
        try {
            const result = await pick({
                type: [types.pdf],
                allowMultiSelection: true,
            });
            const mapped = result.map((f: any) => ({
                uri: f.uri,
                name: f.name || `attached-${Date.now()}.pdf`,
                type: f.type || 'application/pdf',
                size: f.size,
            }));
            setAttachedFilesNew(prev => [...prev, ...mapped]);
        } catch (e: any) {
            if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) { return; }
            Alert.alert('Lỗi chọn file', 'Thiếu module chọn file trong bản build hiện tại. Vui lòng build lại ứng dụng.');
        }
    };

    const handleRemoveExistingSignedFile = (file: TExistingFile) => {
        setExistingSignedFiles(prev => prev.filter(item => item.fileKey !== file.fileKey));
        if (file.filename) {
            if (file.source === 'mainFiles') {
                setMainFilesToRemove(prev => (prev.includes(file.filename) ? prev : [...prev, file.filename]));
            } else {
                setSignedFilesToRemove(prev => (prev.includes(file.filename) ? prev : [...prev, file.filename]));
            }
        }
    };

    const handleRemoveExistingAttachedFile = (file: TExistingFile) => {
        setExistingAttachedFiles(prev => prev.filter(item => item.fileKey !== file.fileKey));
        if (file.filename) {
            setAttachedFilesToRemove(prev => (prev.includes(file.filename) ? prev : [...prev, file.filename]));
        }
    };

    const resetFiles = () => {
        setSignedFilesNew([]);
        setAttachedFilesNew([]);
        setExistingSignedFiles([]);
        setExistingAttachedFiles([]);
        setSignedFilesToRemove([]);
        setAttachedFilesToRemove([]);
        setMainFilesToRemove([]);
    };

    return {
        signedFilesNew,
        setSignedFilesNew,
        attachedFilesNew,
        setAttachedFilesNew,
        existingSignedFiles,
        setExistingSignedFiles,
        existingAttachedFiles,
        setExistingAttachedFiles,
        signedFilesToRemove,
        setSignedFilesToRemove,
        attachedFilesToRemove,
        setAttachedFilesToRemove,
        mainFilesToRemove,
        setMainFilesToRemove,
        handlePickSignedFiles,
        handlePickAttachedFiles,
        handleRemoveExistingSignedFile,
        handleRemoveExistingAttachedFile,
        resetFiles,
    };
};
