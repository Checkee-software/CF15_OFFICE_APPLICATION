import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import { EDocumentPriority, ESignDepartment } from '../components/constants';
import type { TOutgoingItem } from '../types';
import { getLevelKey, resolveCreatorDepartmentCode } from '../utils/index';

import { useOutgoingListState } from './useOutgoingListState';
import { useOutgoingFiles } from './useOutgoingFiles';
import { useOutgoingFormEditor } from './useOutgoingFormEditor';
import { useOutgoingData } from './useOutgoingData';
import { useOutgoingStartEdit } from './useOutgoingStartEdit';
import { useOutgoingFormSubmit } from './useOutgoingFormSubmit';

export function useOutgoingForm() {
    const { userInfo } = useAuthStore();
    const createScrollRef = useRef<any>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [titleValue, setTitleValue] = useState('');
    const [codeValue, setCodeValue] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [priorityValue, setPriorityValue] = useState<EDocumentPriority | ''>('');
    const [signedDepartmentValue, setSignedDepartmentValue] = useState<ESignDepartment | ''>('');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [errors, setErrors] = useState<{ priority?: string; signedDepartment?: string; signedFiles?: string; title?: string; categoryId?: string; registeredNumber?: string }>({});
    const [isPreparingForm, setIsPreparingForm] = useState(false);
    const [editingDocument, setEditingDocument] = useState<TOutgoingItem | null>(null);

    const [selectedSignerUserId, setSelectedSignerUserId] = useState('');
    const [selectedSignerUserName, setSelectedSignerUserName] = useState('');
    const [selectedApproverUserId, setSelectedApproverUserId] = useState('');
    const [selectedApproverUserName, setSelectedApproverUserName] = useState('');
    const [selectedReceiveDeptId, setSelectedReceiveDeptId] = useState('');
    const [selectedReceiveDeptName, setSelectedReceiveDeptName] = useState('');

    const { categories, getCategoryList } = useDocumentCategoryStore();
    const currentUserLevel = userInfo?.userType?.level as EOrganization | undefined;
    const levelKey = getLevelKey(currentUserLevel);
    const creatorDepartmentCode = useMemo(() => resolveCreatorDepartmentCode(userInfo as any), [userInfo]);

    const isLeaderLevel = currentUserLevel === EOrganization.LEADER;
    const isDepartmentLevel = currentUserLevel === EOrganization.DEPARTMENT;
    const isStationaryLevel = currentUserLevel === EOrganization.STATIONARY;
    const canMutateOutgoing = isStationaryLevel || isDepartmentLevel || isLeaderLevel;

    const {
        documents,
        deletingDocument,
        isLoading,
        fetchList,
        askDeleteDocument,
        cancelDeleteDocument,
        confirmDeleteDocument,
        listDocument,
    } = useOutgoingListState(levelKey);

    const {
        departmentList,
        isFetchingDepartments,
        signerUserList,
        approverUserList,
        isFetchingSigners,
        fetchDepartments,
        resetData,
        setSignerUserList,
        setApproverUserList,
    } = useOutgoingData(
        selectedReceiveDeptId,
        signedDepartmentValue,
        selectedSignerUserId,
        selectedApproverUserId,
        setSelectedSignerUserId,
        setSelectedSignerUserName,
        setSelectedApproverUserId,
        setSelectedApproverUserName
    );

    const {
        signedFilesNew, setSignedFilesNew,
        attachedFilesNew, setAttachedFilesNew,
        existingSignedFiles, setExistingSignedFiles,
        existingAttachedFiles, setExistingAttachedFiles,
        signedFilesToRemove, attachedFilesToRemove, mainFilesToRemove,
        handlePickSignedFiles, handlePickAttachedFiles,
        handleRemoveExistingSignedFile, handleRemoveExistingAttachedFile,
        resetFiles,
    } = useOutgoingFiles();

    const {
        editorRef, editorReadyRef, editorFocusedRef, editorContentRequestRef,
        isEditorFocused, setIsEditorFocused,
        editorCommand,
        showFormatMenu, setShowFormatMenu,
        showColorMenu, setShowColorMenu,
        activeFormat,
        editorContent, editorContentVersion, editorContentRef,
        sendEditorCommand, toggleFormat, chooseColor,
        setEditorContentForLoad, handleEditorContentChange, requestEditorContent,
    } = useOutgoingFormEditor();

    const scrollCreateFormToEditor = useCallback((delay = 0) => {
        const scrollToEditor = () => {
            createScrollRef.current?.scrollToEnd?.(true);
            sendEditorCommand('ensureCaretVisible');
        };
        if (delay > 0) {
            setTimeout(scrollToEditor, delay);
            return;
        }
        requestAnimationFrame(scrollToEditor);
    }, [sendEditorCommand]);

    useFocusEffect(useCallback(() => { fetchList(); }, [fetchList]));

    useEffect(() => {
        if (isCreating) { getCategoryList(undefined, { isFromNumbering: true }); }
    }, [getCategoryList, isCreating]);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, (e) => {
            setIsKeyboardVisible(true);
            setKeyboardHeight(e.endCoordinates.height);
            if (editorFocusedRef.current) {
                scrollCreateFormToEditor(Platform.OS === 'ios' ? 160 : 0);
            }
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setIsKeyboardVisible(false);
            setKeyboardHeight(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [editorFocusedRef, scrollCreateFormToEditor]);

    useEffect(() => {
        if (!selectedCategoryId || selectedCategoryName || categories.length === 0) { return; }
        const matched = categories.find(c => c._id === selectedCategoryId);
        if (matched?.name) { setSelectedCategoryName(matched.name); }
    }, [categories, selectedCategoryId, selectedCategoryName]);

    const { openCreateForm, openEditForm } = useOutgoingStartEdit(
        listDocument, isLoading, isPreparingForm, setIsPreparingForm,
        setEditingDocument, setTitleValue, setCodeValue, setKeyboardHeight,
        setEditorContentForLoad, editorReadyRef, editorContentRequestRef,
        setSelectedCategoryId, setSelectedCategoryName, setPriorityValue as any, setSignedDepartmentValue as any,
        setErrors, resetFiles, resetData, setSelectedSignerUserId, setSelectedSignerUserName,
        setSelectedApproverUserId, setSelectedApproverUserName, setSelectedReceiveDeptId,
        setSelectedReceiveDeptName, fetchDepartments, setIsCreating,
        setExistingSignedFiles, setExistingAttachedFiles
    );

    const { handleCreateOutgoing } = useOutgoingFormSubmit(
        titleValue, selectedCategoryId, codeValue, priorityValue, signedDepartmentValue,
        selectedReceiveDeptId, selectedSignerUserId, selectedApproverUserId,
        userInfo?.userType?.department || '', signedFilesNew, attachedFilesNew,
        existingSignedFiles, existingAttachedFiles, signedFilesToRemove, attachedFilesToRemove, mainFilesToRemove,
        editorContent, requestEditorContent, editingDocument,
        isLeaderLevel, isDepartmentLevel, isStationaryLevel,
        setErrors, setIsCreating, fetchList
    );

    return {
        activeFormat,
        approverUserList,
        attachedFilesNew,
        askDeleteDocument,
        cancelDeleteDocument,
        canMutateOutgoing,
        categories,
        chooseColor,
        codeValue,
        confirmDeleteDocument,
        createScrollRef,
        creatorDepartmentCode,
        currentUserLevel,
        deletingDocument,
        departmentList,
        documents,
        editingDocument,
        editorCommand,
        editorContent,
        editorContentVersion,
        editorContentRef,
        editorContentRequestRef,
        editorFocusedRef,
        editorReadyRef,
        editorRef,
        errors,
        existingAttachedFiles,
        existingSignedFiles,
        signedFilesToRemove,
        attachedFilesToRemove,
        mainFilesToRemove,
        handleCreateOutgoing,
        handlePickAttachedFiles,
        handlePickSignedFiles,
        handleEditorContentChange,
        handleRemoveExistingAttachedFile,
        handleRemoveExistingSignedFile,
        isFetchingDepartments,
        isFetchingSigners,
        isCreating,
        isDepartmentLevel,
        isEditorFocused,
        isKeyboardVisible,
        keyboardHeight,
        isLeaderLevel,
        isLoading,
        isPreparingForm,
        isStationaryLevel,
        levelKey,
        openCreateForm,
        openEditForm,
        priorityValue,
        scrollCreateFormToEditor,
        selectedApproverUserId,
        selectedApproverUserName,
        selectedCategoryId,
        selectedCategoryName,
        selectedReceiveDeptId,
        selectedReceiveDeptName,
        selectedSignerUserId,
        selectedSignerUserName,
        sendEditorCommand,
        setApproverUserList,
        setAttachedFilesNew,
        setCodeValue,
        setErrors,
        setIsCreating,
        setIsEditorFocused,
        setPriorityValue,
        setSelectedApproverUserId,
        setSelectedApproverUserName,
        setSelectedCategoryId,
        setSelectedCategoryName,
        setSelectedReceiveDeptId,
        setSelectedReceiveDeptName,
        setSelectedSignerUserId,
        setSelectedSignerUserName,
        setShowColorMenu,
        setShowFormatMenu,
        setSignedDepartmentValue,
        setSignerUserList,
        setSignedFilesNew,
        setTitleValue,
        showColorMenu,
        showFormatMenu,
        signerUserList,
        signedDepartmentValue,
        signedFilesNew,
        titleValue,
        toggleFormat,
        userInfo,
    };
}

export default useOutgoingForm;
