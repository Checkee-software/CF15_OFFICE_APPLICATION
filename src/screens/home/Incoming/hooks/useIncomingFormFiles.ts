import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {
    pick,
    types,
    isErrorWithCode,
    errorCodes,
} from '@react-native-documents/picker';
import {type TPickedFile, type TExistingFile, type TFormMode} from '../utils';

export const useIncomingFormFiles = (formMode: TFormMode) => {
    const [mainFilesNew, setMainFilesNew] = useState<TPickedFile[]>([]);
    const [attachedFilesNew, setAttachedFilesNew] = useState<TPickedFile[]>([]);
    const [existingMainFiles, setExistingMainFiles] = useState<TExistingFile[]>(
        [],
    );
    const [existingAttachedFiles, setExistingAttachedFiles] = useState<
        TExistingFile[]
    >([]);
    const [mainFilesToRemove, setMainFilesToRemove] = useState<string[]>([]);
    const [attachedFilesToRemove, setAttachedFilesToRemove] = useState<
        string[]
    >([]);

    const handlePickMainFiles = useCallback(async (clearErrors: () => void) => {
        try {
            const result = await pick({
                type: [types.pdf],
                allowMultiSelection: true,
            });
            const mapped = result.map((f: any) => ({
                uri: f.uri,
                name: f.name || `main-${Date.now()}.pdf`,
                type: f.type || 'application/pdf',
                size: f.size,
            }));
            setMainFilesNew(prev => [...prev, ...mapped]);
            clearErrors();
        } catch (e: any) {
            if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED)
                {return;}
            Alert.alert(
                'Lỗi chọn file',
                'Thiếu module chọn file trong bản build hiện tại. Vui lòng build lại ứng dụng.',
            );
        }
    }, []);

    const handlePickAttachedFiles = useCallback(
        async (clearErrors: () => void) => {
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
                clearErrors();
            } catch (e: any) {
                if (
                    isErrorWithCode(e) &&
                    e.code === errorCodes.OPERATION_CANCELED
                )
                    {return;}
                Alert.alert(
                    'Lỗi chọn file',
                    'Thiếu module chọn file trong bản build hiện tại. Vui lòng build lại ứng dụng.',
                );
            }
        },
        [],
    );

    const handleRemoveExistingMainFile = useCallback((file: TExistingFile) => {
        setExistingMainFiles(prev =>
            prev.filter(item => item.fileKey !== file.fileKey),
        );
        if (file.filename) {
            setMainFilesToRemove(prev =>
                prev.includes(file.filename) ? prev : [...prev, file.filename],
            );
        }
    }, []);

    const handleRemoveExistingAttachedFile = useCallback(
        (file: TExistingFile) => {
            setExistingAttachedFiles(prev =>
                prev.filter(item => item.fileKey !== file.fileKey),
            );
            if (file.filename) {
                setAttachedFilesToRemove(prev =>
                    prev.includes(file.filename)
                        ? prev
                        : [...prev, file.filename],
                );
            }
        },
        [],
    );

    const handleRemoveNewMainFile = useCallback((file: TPickedFile) => {
        setMainFilesNew(prev => prev.filter(item => item.uri !== file.uri));
    }, []);

    const handleRemoveNewAttachedFile = useCallback((file: TPickedFile) => {
        setAttachedFilesNew(prev => prev.filter(item => item.uri !== file.uri));
    }, []);

    const canRemoveExistingMainFile = useCallback(
        (file: TExistingFile) =>
            file.source === 'signedFiles' || formMode === 'LAYOUT_1',
        [formMode],
    );

    const resetFiles = useCallback(() => {
        setMainFilesNew([]);
        setAttachedFilesNew([]);
        setExistingMainFiles([]);
        setExistingAttachedFiles([]);
        setMainFilesToRemove([]);
        setAttachedFilesToRemove([]);
    }, []);

    return {
        mainFilesNew,
        setMainFilesNew,
        attachedFilesNew,
        setAttachedFilesNew,
        existingMainFiles,
        setExistingMainFiles,
        existingAttachedFiles,
        setExistingAttachedFiles,
        mainFilesToRemove,
        setMainFilesToRemove,
        attachedFilesToRemove,
        setAttachedFilesToRemove,
        handlePickMainFiles,
        handlePickAttachedFiles,
        handleRemoveExistingMainFile,
        handleRemoveExistingAttachedFile,
        handleRemoveNewMainFile,
        handleRemoveNewAttachedFile,
        canRemoveExistingMainFile,
        resetFiles,
    };
};
