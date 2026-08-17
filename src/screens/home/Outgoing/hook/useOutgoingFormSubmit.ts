import { ESignDepartment } from '../components/constants';
import { useDocumentStore } from '@/stores/documentStore';
import type { TOutgoingItem } from '../types';
import type { TPickedFile, TExistingFile } from '../../shared/utils/fileHelpers';

export const useOutgoingFormSubmit = (
    titleValue: string,
    selectedCategoryId: string,
    codeValue: string,
    priorityValue: string | number,
    signedDepartmentValue: string,
    selectedReceiveDeptId: string,
    selectedSignerUserId: string,
    selectedApproverUserId: string,
    userDepartmentId: string,
    signedFilesNew: TPickedFile[],
    attachedFilesNew: TPickedFile[],
    existingSignedFiles: TExistingFile[],
    existingAttachedFiles: TExistingFile[],
    signedFilesToRemove: string[],
    attachedFilesToRemove: string[],
    mainFilesToRemove: string[],
    editorContent: string,
    requestEditorContent: () => Promise<string>,
    editingDocument: TOutgoingItem | null,
    isLeaderLevel: boolean,
    isDepartmentLevel: boolean,
    isStationaryLevel: boolean,
    setErrors: React.Dispatch<React.SetStateAction<any>>,
    setIsCreating: React.Dispatch<React.SetStateAction<boolean>>,
    fetchList: () => void
) => {
    const { createOutgoingDocument, updateOutgoingDocument } = useDocumentStore();

    const handleCreateOutgoing = async (targetStatus: 'SENDING' | 'DRAFT' = 'SENDING') => {
        const nextErrors: { priority?: string; signedDepartment?: string; signedFiles?: string; title?: string; categoryId?: string; registeredNumber?: string } = {};
        if (!titleValue.trim()) { nextErrors.title = 'Bắt buộc!'; }
        if (!selectedCategoryId) { nextErrors.categoryId = 'Vui lòng chọn!'; }
        if (!codeValue.trim()) { nextErrors.registeredNumber = 'Bắt buộc!'; }
        if (!priorityValue) { nextErrors.priority = 'Vui lòng chọn!'; }
        if (!signedDepartmentValue) { nextErrors.signedDepartment = 'Vui lòng chọn!'; }
        const totalSignedFiles = signedFilesNew.length + existingSignedFiles.length;
        if (totalSignedFiles === 0) {
            nextErrors.signedFiles = 'Vui lòng tải lên ít nhất 1 file trình ký!';
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) { return; }

        const isEditingOutgoing = Boolean(editingDocument?.id);
        const canCreateDraft = (isLeaderLevel || isDepartmentLevel || isStationaryLevel) && !isEditingOutgoing;
        const effectiveStatus: 'SENDING' | 'DRAFT' = canCreateDraft && targetStatus === 'DRAFT' ? 'DRAFT' : 'SENDING';

        const latestEditorContent = await requestEditorContent();

        const formData = new FormData();
        formData.append('title', titleValue);
        formData.append('content', (latestEditorContent || editorContent || titleValue).trim());
        formData.append('priority', String(priorityValue));
        formData.append('registeredNumber', codeValue);
        formData.append('categoryId', selectedCategoryId);
        formData.append('departmentId', userDepartmentId || '');
        formData.append('version', '1.0');
        formData.append('receiveDepartmentId', selectedReceiveDeptId || userDepartmentId || '');
        formData.append('status', effectiveStatus);
        formData.append('signedDepartment', signedDepartmentValue);
        if (selectedSignerUserId) {
            formData.append('signerUserId', selectedSignerUserId);
        }
        if (signedDepartmentValue === ESignDepartment.MANAGEMENT && selectedApproverUserId) {
            formData.append('approverUserId', selectedApproverUserId);
        }

        signedFilesNew.forEach((file, index) => {
            formData.append('signedFiles', {
                uri: file.uri,
                name: file.name || `signed-file-${index}.pdf`,
                type: file.type || 'application/pdf',
            } as any);
        });
        attachedFilesNew.forEach((file, index) => {
            formData.append('attachedFiles', {
                uri: file.uri,
                name: file.name || `attached-file-${index}.pdf`,
                type: file.type || 'application/pdf',
            } as any);
        });

        if (editingDocument?.id) {
            const keptSignedFiles = existingSignedFiles
                .map(file => file.filename)
                .filter(Boolean);
            const keptAttachedFiles = existingAttachedFiles
                .map(file => file.filename)
                .filter(Boolean);

            formData.append('existingSignedFiles', JSON.stringify(keptSignedFiles));
            formData.append('existingAttachedFiles', JSON.stringify(keptAttachedFiles));
            formData.append('signedFilesToRemove', JSON.stringify(signedFilesToRemove));
            formData.append('attachedFilesToRemove', JSON.stringify(attachedFilesToRemove));
            formData.append('mainFilesToRemove', JSON.stringify(mainFilesToRemove));
        }
        const ok = editingDocument?.id
            ? await updateOutgoingDocument(editingDocument.id, formData)
            : await createOutgoingDocument(formData);
        if (ok) {
            setIsCreating(false);
            fetchList();
        }
    };

    return {
        handleCreateOutgoing,
    };
};
