import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { EDocumentPriority } from '@/shared-types/common/Document/document';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import {
    buildCategoryPath,
    getLevelKey,
    isObjectId,
    type TFocusableIncomingField,
    type TFormMode,
} from '../utils';
import { useIncomingFormFiles } from './useIncomingFormFiles';
import { useIncomingFormEditor } from './useIncomingFormEditor';
import { useIncomingFormDelete } from './useIncomingFormDelete';
import { useIncomingFormDatePicker } from './useIncomingFormDatePicker';
import { useIncomingFormAssignment } from './useIncomingFormAssignment';
import { useIncomingFormSubmit } from './useIncomingFormSubmit';
import { useIncomingListState } from './useIncomingListState';

let incomingCategoryListPromise: Promise<void> | null = null;

export const useIncomingForm = () => {
    const { userInfo } = useAuthStore();
    const { listDocument, getListDocument, deleteDocument, isLoading } =
        useDocumentStore();
    const {
        categories,
        getCategoryList,
        isLoading: isLoadingCategories,
    } = useDocumentCategoryStore();

    const levelKey = getLevelKey(userInfo?.userType?.level as EOrganization);
    const isStationary = levelKey === 'STATIONARY';

    // --------------------------------------------------------------------------
    // Form state
    // --------------------------------------------------------------------------
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<TFormMode>('CREATE');
    const [activeTabKey, setActiveTabKey] = useState<string>('ALL');
    const [searchText, setSearchText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isPreparingForm, setIsPreparingForm] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    const [titleValue, setTitleValue] = useState('');
    const [organizationValue, setOrganizationValue] = useState('');
    const [senderValue, setSenderValue] = useState('');
    const [registeredNumberValue, setRegisteredNumberValue] = useState('');
    const [categoryIdValue, setCategoryIdValue] = useState('');
    const [categoryNameValue, setCategoryNameValue] = useState('');
    const [priorityValue, setPriorityValue] = useState<EDocumentPriority | ''>('');

    const [focusedField, setFocusedField] =
        useState<TFocusableIncomingField | null>(null);
    const [errors, setErrors] = useState<{
        title?: string;
        organization?: string;
        sender?: string;
        categoryId?: string;
        priority?: string;
        registeredNumber?: string;
        mainFiles?: string;
        attachedFiles?: string;
        destinationCategoryId?: string;
        leadDepartmentId?: string;
        finishedAt?: string;
    }>({});

    const titleInputRef = useRef<TextInput>(null);
    const organizationInputRef = useRef<TextInput>(null);
    const senderInputRef = useRef<TextInput>(null);
    const registeredNumberInputRef = useRef<TextInput>(null);

    const showRegisterSection = formMode === 'LAYOUT_3' || formMode === 'LAYOUT_4';
    const showAssignSection = formMode === 'LAYOUT_3' || formMode === 'LAYOUT_4';
    const isLayout4 = formMode === 'LAYOUT_4';
    const isFormBusy = isPreparingForm || isSubmittingForm;
    const isLoadingDestinationOptions = isLoadingCategories && categories.length === 0;

    // --------------------------------------------------------------------------
    // Sub-hooks
    // --------------------------------------------------------------------------

    const filesHook = useIncomingFormFiles(formMode);
    const {
        mainFilesNew, attachedFilesNew, existingMainFiles, existingAttachedFiles,
        handlePickMainFiles: rawHandlePickMainFiles,
        handlePickAttachedFiles: rawHandlePickAttachedFiles,
        handleRemoveExistingMainFile, handleRemoveExistingAttachedFile,
        handleRemoveNewMainFile, handleRemoveNewAttachedFile,
        canRemoveExistingMainFile,
    } = filesHook;

    const handlePickMainFiles = useCallback(() => {
        rawHandlePickMainFiles(() =>
            setErrors(prev => ({ ...prev, mainFiles: undefined })),
        );
    }, [rawHandlePickMainFiles]);

    const handlePickAttachedFiles = useCallback(() => {
        rawHandlePickAttachedFiles(() =>
            setErrors(prev => ({ ...prev, attachedFiles: undefined })),
        );
    }, [rawHandlePickAttachedFiles]);

    const editorHook = useIncomingFormEditor(showForm, editingId, formMode);
    const {
        editorRef, formScrollRef, editorContentRef, editorReadyRef, editorFocusedRef,
        editorContentRequestRef, isEditorFocused, isKeyboardVisible, keyboardHeight,
        shouldMountEditor, activeFormat, editorCommand, initialEditorHtml,
        scrollFormToEditor, clearEditorFocus, commitEditorContent,
        sendEditorCommand, toggleFormat, chooseColor,
        setShowFormatMenu, setShowColorMenu, showColorMenu, showFormatMenu,
        setInitialEditorHtml, setIsEditorFocused,
    } = editorHook;

    // We need a stable ref for resetMenus to break circular dependency
    const resetMenusRef = useRef<() => void>(() => {});

    const datePickerHook = useIncomingFormDatePicker(
        clearEditorFocus,
        () => resetMenusRef.current(),
        setFocusedField,
        setErrors,
    );
    const {
        createdAtValue, finishedAtValue, finishedAtDisplay,
        showCreatedDatePicker, showFinishedDatePicker,
        datePickerDraft, datePickerError,
        openCreatedDatePicker, openFinishedDatePicker,
        closeDatePicker, applyRelativeDate, submitDatePickerDraft,
        setShowCreatedDatePicker, setShowFinishedDatePicker,
        setDatePickerDraft, setDatePickerError,
    } = datePickerHook;

    const ensureIncomingCategoryList = useCallback(() => {
        const categoryState = useDocumentCategoryStore.getState();
        if (categoryState.categories.length > 0) { return Promise.resolve(); }
        if (categoryState.isLoading && !incomingCategoryListPromise) {
            return Promise.resolve();
        }
        if (incomingCategoryListPromise) { return incomingCategoryListPromise; }
        incomingCategoryListPromise = getCategoryList(undefined, {
            isFromNumbering: true,
        }).finally(() => { incomingCategoryListPromise = null; });
        return incomingCategoryListPromise;
    }, [getCategoryList]);

    const assignmentHook = useIncomingFormAssignment(
        categories, priorityValue, setPriorityValue,
        finishedAtValue, finishedAtDisplay,
        setErrors, showForm, showAssignSection,
        ensureIncomingCategoryList, clearEditorFocus, setFocusedField,
        editorFocusedRef, resetMenusRef,
        categoryIdValue, setCategoryIdValue, setCategoryNameValue,
    );
    const {
        destinationSelectionIds, destinationCategoryHint, destinationLevelOptions,
        showCategoryMenu, showPriorityMenu, showLeadDepartmentMenu,
        showReceiveMenu, showSupportDepartmentMenu, showDestinationLevel,
        departmentOptions, isLoadingAssignmentOptions,
        destinationDropdownOptions, leadDepartmentDropdownOptions,
        receiveDropdownOptions, supportDepartmentDropdownOptions,
        categoryDropdownOptions, priorityDropdownOptions,
        selectDestinationOption, selectLeadDepartmentOption,
        toggleReceiveToKnowOption, toggleSupportDepartmentOption,
        selectCategoryOption, selectPriorityOption,
        selectedLeadDepartmentName, selectedReceiveToKnowText, selectedSupportDepartmentText,
        toggleMenu, toggleDestinationMenu, destinationPathLabel,
        supportDepartmentIds, receiveToKnowIds,
        setShowCategoryMenu, setShowPriorityMenu, setShowLeadDepartmentMenu,
        setShowReceiveMenu, setShowSupportDepartmentMenu, setShowDestinationLevel,
        categoryById, leadDepartmentId, leadAgencyValue,
        setLeadAgencyValue, setLeadAgencyPayloadValue, setLeadDepartmentId,
        setDestinationSelectionIds, setDestinationCategoryHint,
    } = assignmentHook;

    // Initialize resetMenusRef
    resetMenusRef.current = useCallback(() => {
        setShowCategoryMenu(false);
        setShowPriorityMenu(false);
        setShowLeadDepartmentMenu(false);
        setShowReceiveMenu(false);
        setShowSupportDepartmentMenu(false);
        setShowDestinationLevel(null);
        setShowCreatedDatePicker(false);
        setShowFinishedDatePicker(false);
        setDatePickerDraft('');
        setDatePickerError('');
        setShowFormatMenu(false);
        setShowColorMenu(false);
    }, [
        setShowCategoryMenu, setShowPriorityMenu, setShowLeadDepartmentMenu,
        setShowReceiveMenu, setShowSupportDepartmentMenu, setShowDestinationLevel,
        setShowCreatedDatePicker, setShowFinishedDatePicker,
        setDatePickerDraft, setDatePickerError, setShowFormatMenu, setShowColorMenu,
    ]);

    const resetMenus = resetMenusRef.current;

    const deleteHook = useIncomingFormDelete(deleteDocument, getListDocument, isLoading);
    const { deletingId, deletingTitle, isDeleting, requestDelete, cancelDelete, confirmDelete } =
        deleteHook;

    const submitHook = useIncomingFormSubmit(
        {
            showForm, setShowForm, formMode, setFormMode, editingId, setEditingId,
            isPreparingForm, setIsPreparingForm, isSubmittingForm, setIsSubmittingForm,
            titleValue, setTitleValue, organizationValue, setOrganizationValue,
            senderValue, setSenderValue, registeredNumberValue, setRegisteredNumberValue,
            categoryIdValue, setCategoryIdValue, categoryNameValue, setCategoryNameValue,
            priorityValue, setPriorityValue, focusedField, setFocusedField,
            errors, setErrors, isStationary,
        },
        filesHook, editorHook, datePickerHook, assignmentHook, deleteHook,
        ensureIncomingCategoryList, resetMenus,
    );
    const {
        resetForm, openCreateForm, startEdit, submitLayout1, submitLayout3,
        submitLayout4, startEditLockRef, submitLayout4LockRef,
    } = submitHook;

    // List state (tabs, filteredDocs, etc.)
    const { tabs, docs, activeTab, filteredDocs } = useIncomingListState(
        levelKey, listDocument, searchText, activeTabKey,
    );

    // --------------------------------------------------------------------------
    // Event handlers
    // --------------------------------------------------------------------------
    const dismissKeyboardAndMenus = () => {
        Keyboard.dismiss();
        clearEditorFocus();
        setFocusedField(null);
        resetMenus();
    };

    const handleInputFocus = (field: TFocusableIncomingField) => {
        clearEditorFocus();
        resetMenus();
        setFocusedField(field);
    };

    // --------------------------------------------------------------------------
    // Effects
    // --------------------------------------------------------------------------
    useFocusEffect(
        useCallback(() => {
            if (!showForm) { getListDocument({ type: 'INCOMING' }); }
        }, [getListDocument, showForm]),
    );

    useEffect(() => {
        if (!showForm) { return; }
        ensureIncomingCategoryList();
    }, [ensureIncomingCategoryList, showForm]);

    useEffect(() => { setActiveTabKey('ALL'); }, [levelKey]);

    useEffect(() => {
        if (!tabs.some(tab => tab.key === activeTabKey)) { setActiveTabKey('ALL'); }
    }, [tabs, activeTabKey]);

    useEffect(() => {
        if (!categoryIdValue || categoryNameValue || categories.length === 0) { return; }
        const matched = categories.find(cat => cat._id === categoryIdValue);
        if (matched?.name) { setCategoryNameValue(matched.name); }
    }, [categories, categoryIdValue, categoryNameValue]);

    useEffect(() => {
        if (!leadDepartmentId) { return; }
        const matched = departmentOptions.find(dep => dep.id === leadDepartmentId);
        if (matched?.name) {
            setLeadAgencyValue(matched.name);
            setLeadAgencyPayloadValue(matched.code || matched.id);
        }
    }, [leadDepartmentId, departmentOptions, setLeadAgencyValue, setLeadAgencyPayloadValue]);

    useEffect(() => {
        if (!leadAgencyValue || leadDepartmentId || departmentOptions.length === 0) { return; }
        const normalizedLeadAgency = String(leadAgencyValue).trim();
        const matchedDepartment = departmentOptions.find(
            dep =>
                dep.id === normalizedLeadAgency ||
                String(dep.code || '').trim() === normalizedLeadAgency ||
                dep.name === normalizedLeadAgency,
        );
        if (matchedDepartment?.id) {
            setLeadDepartmentId(matchedDepartment.id);
            setLeadAgencyPayloadValue(matchedDepartment.code || matchedDepartment.id);
        }
    }, [leadAgencyValue, leadDepartmentId, departmentOptions, setLeadDepartmentId, setLeadAgencyPayloadValue]);

    useEffect(() => {
        if (!showForm || !destinationCategoryHint || !isObjectId(destinationCategoryHint) ||
            !categoryById[destinationCategoryHint]) {
            return;
        }
        setDestinationSelectionIds(buildCategoryPath(destinationCategoryHint, categoryById));
        setDestinationCategoryHint('');
    }, [categoryById, destinationCategoryHint, showForm, setDestinationSelectionIds, setDestinationCategoryHint]);

    // --------------------------------------------------------------------------
    // Return
    // --------------------------------------------------------------------------
    return {
        activeFormat, activeTab, applyRelativeDate, attachedFilesNew,
        cancelDelete, canRemoveExistingMainFile, categoryDropdownOptions, categoryNameValue,
        chooseColor, closeDatePicker, commitEditorContent, confirmDelete,
        createdAtValue, datePickerDraft, datePickerError,
        deletingId, deletingTitle, destinationCategoryHint,
        destinationDropdownOptions, destinationLevelOptions, destinationPathLabel,
        destinationSelectionIds, dismissKeyboardAndMenus, docs,
        editorCommand, editorContentRef, editorContentRequestRef, editorFocusedRef,
        editorReadyRef, editorRef, editingId, errors,
        existingAttachedFiles, existingMainFiles, filteredDocs,
        finishedAtDisplay, focusedField, formMode, formScrollRef,
        handleInputFocus, handlePickAttachedFiles, handlePickMainFiles,
        handleRemoveExistingAttachedFile, handleRemoveExistingMainFile,
        handleRemoveNewAttachedFile, handleRemoveNewMainFile,
        isDeleting, isEditorFocused, isFormBusy, isKeyboardVisible, keyboardHeight,
        isLayout4, isLoading, isLoadingAssignmentOptions, isLoadingDestinationOptions,
        isPreparingForm, isStationary, initialEditorHtml,
        leadDepartmentDropdownOptions, mainFilesNew, openCreateForm,
        openCreatedDatePicker, openFinishedDatePicker,
        organizationInputRef, organizationValue,
        priorityDropdownOptions, priorityValue, receiveDropdownOptions, receiveToKnowIds,
        registeredNumberInputRef, registeredNumberValue,
        requestDelete, resetForm, resetMenus, scrollFormToEditor, searchText,
        selectCategoryOption, selectDestinationOption, selectLeadDepartmentOption,
        selectPriorityOption, selectedLeadDepartmentName,
        selectedReceiveToKnowText, selectedSupportDepartmentText,
        sendEditorCommand, senderInputRef, senderValue,
        setActiveTabKey, setDatePickerDraft, setDatePickerError, setErrors,
        setFocusedField, setInitialEditorHtml, setIsEditorFocused,
        setOrganizationValue, setRegisteredNumberValue, setSearchText, setSenderValue,
        setShowCategoryMenu, setShowColorMenu, setShowForm, setShowFormatMenu,
        setShowLeadDepartmentMenu, setShowPriorityMenu, setShowReceiveMenu,
        setShowSupportDepartmentMenu, setTitleValue,
        shouldMountEditor, showAssignSection, showCategoryMenu, showColorMenu,
        showCreatedDatePicker, showFinishedDatePicker, showForm, showFormatMenu,
        showLeadDepartmentMenu, showPriorityMenu, showReceiveMenu, showRegisterSection,
        showSupportDepartmentMenu, showDestinationLevel, startEdit,
        submitDatePickerDraft, submitLayout1, submitLayout3, submitLayout4,
        supportDepartmentDropdownOptions, supportDepartmentIds, tabs, titleInputRef, titleValue,
        toggleDestinationMenu, toggleFormat, toggleMenu,
        toggleReceiveToKnowOption, toggleSupportDepartmentOption,
        startEditLockRef, submitLayout4LockRef,
    };
};
