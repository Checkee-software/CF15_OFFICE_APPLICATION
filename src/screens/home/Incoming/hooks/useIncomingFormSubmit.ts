import React, { useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useDocumentStore } from '@/stores/documentStore';
import {
    EDocumentPriority,
    EDocumentStatus,
} from '@/shared-types/common/Document/document';
import {
    type TFormMode,
    type TFocusableIncomingField,
} from '../utils';
import {
    saveStoredAssignmentDraft,
    removeStoredAssignmentDraft,
} from '../utils/assignmentStorage';
import { useIncomingStartEdit } from './useIncomingStartEdit';

export const useIncomingFormSubmit = (
    state: {
        showForm: boolean;
        setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
        formMode: TFormMode;
        setFormMode: React.Dispatch<React.SetStateAction<TFormMode>>;
        editingId: string | null;
        setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
        isPreparingForm: boolean;
        setIsPreparingForm: React.Dispatch<React.SetStateAction<boolean>>;
        isSubmittingForm: boolean;
        setIsSubmittingForm: React.Dispatch<React.SetStateAction<boolean>>;
        titleValue: string;
        setTitleValue: React.Dispatch<React.SetStateAction<string>>;
        organizationValue: string;
        setOrganizationValue: React.Dispatch<React.SetStateAction<string>>;
        senderValue: string;
        setSenderValue: React.Dispatch<React.SetStateAction<string>>;
        registeredNumberValue: string;
        setRegisteredNumberValue: React.Dispatch<React.SetStateAction<string>>;
        categoryIdValue: string;
        setCategoryIdValue: React.Dispatch<React.SetStateAction<string>>;
        categoryNameValue: string;
        setCategoryNameValue: React.Dispatch<React.SetStateAction<string>>;
        priorityValue: EDocumentPriority | '';
        setPriorityValue: React.Dispatch<React.SetStateAction<EDocumentPriority | ''>>;
        focusedField: TFocusableIncomingField | null;
        setFocusedField: React.Dispatch<React.SetStateAction<TFocusableIncomingField | null>>;
        errors: any;
        setErrors: React.Dispatch<React.SetStateAction<any>>;
        isStationary: boolean;
    },
    filesHook: any,
    editorHook: any,
    datePickerHook: any,
    assignmentHook: any,
    deleteHook: any,
    ensureIncomingCategoryList: () => Promise<void>,
    resetMenus: () => void,
) => {
    const {
        getListDocument,
        createIncomingDocument,
        updateIncomingDraft,
        registerIncomingDocument,
        assignIncomingDocument,
    } = useDocumentStore();

    const submitLayout4LockRef = useRef(false);

    // ---------------------------------------------------------------------------
    // resetForm & openCreateForm
    // ---------------------------------------------------------------------------

    const resetForm = useCallback(() => {
        state.setEditingId(null);
        state.setFormMode('CREATE');
        state.setTitleValue('');
        state.setOrganizationValue('');
        state.setSenderValue('');
        state.setRegisteredNumberValue('');
        state.setCategoryIdValue('');
        state.setCategoryNameValue('');
        state.setPriorityValue('');
        editorHook.resetEditor();
        filesHook.resetFiles();
        datePickerHook.resetDatePicker();
        assignmentHook.resetAssignment();
        deleteHook.resetDeleteState();
        submitLayout4LockRef.current = false;
        state.setIsSubmittingForm(false);
        state.setFocusedField(null);
        state.setErrors({});
        resetMenus();
    }, [state, editorHook, filesHook, datePickerHook, assignmentHook, deleteHook, resetMenus]);

    const openCreateForm = useCallback(() => {
        if (state.isPreparingForm) { return; }
        resetForm();
        state.setFormMode('CREATE');
        ensureIncomingCategoryList();
        state.setShowForm(true);
    }, [ensureIncomingCategoryList, state, resetForm]);

    // ---------------------------------------------------------------------------
    // startEdit (delegated to useIncomingStartEdit)
    // ---------------------------------------------------------------------------

    const { startEdit, startEditLockRef } = useIncomingStartEdit({
        state,
        filesHook,
        editorHook,
        datePickerHook,
        assignmentHook,
        ensureIncomingCategoryList,
        resetMenus,
        resetForm,
    });

    // ---------------------------------------------------------------------------
    // FormData builders
    // ---------------------------------------------------------------------------

    const appendBaseFields = (
        formData: FormData,
        statusValue?: EDocumentStatus,
        contentOverride?: string,
    ) => {
        formData.append('title', state.titleValue.trim());
        formData.append('organization', state.organizationValue.trim());
        formData.append('sender', state.senderValue.trim());
        formData.append('registeredNumber', state.registeredNumberValue.trim());
        if (statusValue) { formData.append('status', statusValue); }
        formData.append('priority', state.priorityValue);
        formData.append('categoryId', state.categoryIdValue);
        const contentValue =
            contentOverride ?? editorHook.editorContentRef.current;
        formData.append(
            'content',
            (contentValue || editorHook.editorContent || state.titleValue).trim(),
        );
        formData.append('createdAt', datePickerHook.createdAtValue);
        formData.append('startAt', datePickerHook.createdAtValue);
    };

    const appendNewFiles = (formData: FormData) => {
        filesHook.mainFilesNew.forEach((file: any, index: number) => {
            formData.append('mainFiles', {
                uri: file.uri,
                name: file.name || `main-file-${index}.pdf`,
                type: file.type || 'application/pdf',
            } as any);
        });
        filesHook.attachedFilesNew.forEach((file: any, index: number) => {
            formData.append('attachedFiles', {
                uri: file.uri,
                name: file.name || `attached-file-${index}.pdf`,
                type: file.type || 'application/pdf',
            } as any);
        });
    };

    const appendAssignmentFields = (formData: FormData) => {
        formData.append('leadAgency', assignmentHook.getLeadAgencyPayload());
        formData.append('departmentId', assignmentHook.leadDepartmentId);
        formData.append('leadDepartmentId', assignmentHook.leadDepartmentId);
        formData.append('receiveDepartmentId', assignmentHook.leadDepartmentId);
        formData.append('finishedAt', datePickerHook.finishedAtValue);
        formData.append('receiveToKnow', JSON.stringify(assignmentHook.receiveToKnowIds));
        formData.append('receiveToKnowIds', JSON.stringify(assignmentHook.receiveToKnowIds));
        formData.append('supportDepartmentId', JSON.stringify(assignmentHook.supportDepartmentIds));
        formData.append('supportDepartmentIds', JSON.stringify(assignmentHook.supportDepartmentIds));
    };

    // ---------------------------------------------------------------------------
    // Validators
    // ---------------------------------------------------------------------------

    const validateBaseFields = (nextErrors: any) => {
        if (!state.titleValue.trim()) { nextErrors.title = 'Bắt buộc!'; }
        if (!state.organizationValue.trim()) { nextErrors.organization = 'Bắt buộc!'; }
        if (!state.registeredNumberValue.trim()) { nextErrors.registeredNumber = 'Bắt buộc!'; }
        if (!state.categoryIdValue) { nextErrors.categoryId = 'Vui lòng chọn!'; }
        if (!state.priorityValue) { nextErrors.priority = 'Vui lòng chọn!'; }
    };
    const validateDraftFields = (nextErrors: any) => {
        validateBaseFields(nextErrors);
        if (!state.senderValue.trim()) { nextErrors.sender = 'Bắt buộc!'; }
    };
    const validateRegisterOnlyFields = (nextErrors: any) => {
        if (!assignmentHook.selectedDestinationId) {
            nextErrors.destinationCategoryId = 'Vui lòng chọn!';
        }
    };
    const validateAssignFields = (nextErrors: any) => {
        if (!assignmentHook.leadDepartmentId) {
            nextErrors.leadDepartmentId = 'Vui lòng chọn!';
        }
        if (!datePickerHook.finishedAtValue) {
            nextErrors.finishedAt = 'Vui lòng chọn ngày!';
        }
    };

    // ---------------------------------------------------------------------------
    // Submit actions
    // ---------------------------------------------------------------------------

    const submitLayout1 = async (asDraft: boolean) => {
        if (state.isSubmittingForm) { return; }
        Keyboard.dismiss();
        editorHook.clearEditorFocus();
        state.setFocusedField(null);
        const nextErrors: any = {};
        validateDraftFields(nextErrors);
        const totalMainFiles =
            filesHook.mainFilesNew.length + filesHook.existingMainFiles.length;
        if (!state.editingId && totalMainFiles === 0) {
            nextErrors.mainFiles = 'Vui lòng tải lên ít nhất 1 file văn bản chính!';
        }
        state.setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) { return; }

        state.setIsSubmittingForm(true);
        try {
            const latestEditorContent = await editorHook.requestEditorContent();
            const formData = new FormData();
            const statusForSubmit = asDraft
                ? EDocumentStatus.DRAFT
                : EDocumentStatus.STATIONARY_RECEIVED;
            appendBaseFields(formData, statusForSubmit, latestEditorContent);
            appendNewFiles(formData);
            if (state.editingId) {
                formData.append('mainFilesToRemove', JSON.stringify(filesHook.mainFilesToRemove));
                formData.append('attachedFilesToRemove', JSON.stringify(filesHook.attachedFilesToRemove));
            }
            const ok = state.editingId
                ? await updateIncomingDraft(state.editingId, formData)
                : await createIncomingDocument(formData);
            if (!ok) { return; }
            state.setShowForm(false);
            resetForm();
            getListDocument({ type: 'INCOMING' });
        } finally {
            state.setIsSubmittingForm(false);
        }
    };

    const buildRegisterFormData = (contentOverride?: string) => {
        const formData = new FormData();
        appendBaseFields(formData, undefined, contentOverride);
        formData.append('destinationCategoryId', assignmentHook.selectedDestinationId);
        appendAssignmentFields(formData);
        formData.append('mainFilesToRemove', JSON.stringify(filesHook.mainFilesToRemove));
        formData.append('attachedFilesToRemove', JSON.stringify(filesHook.attachedFilesToRemove));
        appendNewFiles(formData);
        return formData;
    };

    const buildAssignFormData = (
        options?: { includeFiles?: boolean; includeFilesToRemove?: boolean },
        contentOverride?: string,
    ) => {
        const formData = new FormData();
        appendBaseFields(formData, undefined, contentOverride);
        if (assignmentHook.selectedDestinationId) {
            formData.append('destinationCategoryId', assignmentHook.selectedDestinationId);
        }
        appendAssignmentFields(formData);
        formData.append(
            'mainFilesToRemove',
            JSON.stringify(options?.includeFilesToRemove === false ? [] : filesHook.mainFilesToRemove),
        );
        formData.append(
            'attachedFilesToRemove',
            JSON.stringify(options?.includeFilesToRemove === false ? [] : filesHook.attachedFilesToRemove),
        );
        if (options?.includeFiles) { appendNewFiles(formData); }
        return formData;
    };

    const submitLayout3 = async () => {
        if (!state.editingId || state.isSubmittingForm) { return; }
        Keyboard.dismiss();
        editorHook.clearEditorFocus();
        state.setFocusedField(null);
        const nextErrors: any = {};
        validateBaseFields(nextErrors);
        validateRegisterOnlyFields(nextErrors);
        validateAssignFields(nextErrors);
        state.setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) { return; }

        state.setIsSubmittingForm(true);
        try {
            const latestEditorContent = await editorHook.requestEditorContent();
            const ok = await registerIncomingDocument(
                state.editingId,
                buildRegisterFormData(latestEditorContent),
            );
            if (!ok) { return; }
            const assignmentDraft = assignmentHook.buildCurrentAssignmentDraft();
            assignmentHook.assignmentDraftsRef.current[state.editingId] = assignmentDraft;
            await saveStoredAssignmentDraft(state.editingId, assignmentDraft);
            state.setShowForm(false);
            resetForm();
            getListDocument({ type: 'INCOMING' });
        } finally {
            state.setIsSubmittingForm(false);
        }
    };

    const submitLayout4 = async () => {
        if (!state.editingId) { return; }
        if (state.isSubmittingForm || submitLayout4LockRef.current) { return; }
        submitLayout4LockRef.current = true;
        try {
            Keyboard.dismiss();
            editorHook.clearEditorFocus();
            state.setFocusedField(null);
            const nextErrors: any = {};
            validateBaseFields(nextErrors);
            validateAssignFields(nextErrors);
            state.setErrors(nextErrors);
            if (Object.keys(nextErrors).length > 0) { return; }
            state.setIsSubmittingForm(true);
            const latestEditorContent = await editorHook.requestEditorContent();
            const ok = await assignIncomingDocument(
                state.editingId,
                buildAssignFormData(
                    { includeFiles: true, includeFilesToRemove: true },
                    latestEditorContent,
                ),
            );
            if (!ok) { return; }
            delete assignmentHook.assignmentDraftsRef.current[state.editingId];
            await removeStoredAssignmentDraft(state.editingId);
            state.setShowForm(false);
            resetForm();
            getListDocument({ type: 'INCOMING' });
        } finally {
            submitLayout4LockRef.current = false;
            state.setIsSubmittingForm(false);
        }
    };

    return {
        resetForm,
        openCreateForm,
        startEdit,
        submitLayout1,
        submitLayout3,
        submitLayout4,
        startEditLockRef,
        submitLayout4LockRef,
    };
};
