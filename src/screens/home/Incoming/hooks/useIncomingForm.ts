import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { EDocumentPriority, EDocumentStatus } from '@/shared-types/common/Document/document';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import {
  INCOMING_ALL_TABS,
  INCOMING_LEVEL_ALLOWED_STATUSES,
  buildCategoryPath,
  getLevelKey,
  isObjectId,
  mapIncomingStatusLabel,
  type TFocusableIncomingField,
  type TFormMode,
  type TIncomingItem,
  type TTab,
} from '../utils';
import { useIncomingFormFiles } from './useIncomingFormFiles';
import { useIncomingFormEditor } from './useIncomingFormEditor';
import { useIncomingFormDelete } from './useIncomingFormDelete';
import { useIncomingFormDatePicker } from './useIncomingFormDatePicker';
import { useIncomingFormAssignment } from './useIncomingFormAssignment';
import { useIncomingFormSubmit } from './useIncomingFormSubmit';

let incomingCategoryListPromise: Promise<void> | null = null;

export const useIncomingForm = () => {
  const { userInfo } = useAuthStore();
  const {
    listDocument,
    getListDocument,
    deleteDocument,
    isLoading,
  } = useDocumentStore();
  const {
    categories,
    getCategoryList,
    isLoading: isLoadingCategories,
  } = useDocumentCategoryStore();

  const levelKey = getLevelKey(userInfo?.userType?.level as EOrganization);
  const isStationary = levelKey === 'STATIONARY';

  const allTabs = useMemo<TTab[]>(
    () => [{ key: 'ALL', label: 'Tất cả', statuses: [] }, ...INCOMING_ALL_TABS],
    [],
  );
  const allowedStatusesByLevel = useMemo<EDocumentStatus[]>(
    () => INCOMING_LEVEL_ALLOWED_STATUSES[levelKey] || [],
    [levelKey],
  );
  const tabs = useMemo<TTab[]>(
    () =>
      allTabs.filter(tab =>
        tab.key === 'ALL' ||
        tab.statuses.some(status => allowedStatusesByLevel.includes(status)),
      ),
    [allTabs, allowedStatusesByLevel],
  );

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

  const [focusedField, setFocusedField] = useState<TFocusableIncomingField | null>(null);
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

  // 1. Files Hook
  const filesHook = useIncomingFormFiles(formMode);
  const {
    mainFilesNew,
    attachedFilesNew,
    existingMainFiles,
    existingAttachedFiles,
    filesToRemove,
    handlePickMainFiles: rawHandlePickMainFiles,
    handlePickAttachedFiles: rawHandlePickAttachedFiles,
    handleRemoveExistingMainFile,
    handleRemoveExistingAttachedFile,
    handleRemoveNewMainFile,
    handleRemoveNewAttachedFile,
    canRemoveExistingMainFile,
  } = filesHook;

  const handlePickMainFiles = useCallback(() => {
    rawHandlePickMainFiles(() => setErrors(prev => ({ ...prev, mainFiles: undefined })));
  }, [rawHandlePickMainFiles]);

  const handlePickAttachedFiles = useCallback(() => {
    rawHandlePickAttachedFiles(() => setErrors(prev => ({ ...prev, attachedFiles: undefined })));
  }, [rawHandlePickAttachedFiles]);

  // 2. Editor Hook
  const editorHook = useIncomingFormEditor(showForm, editingId, formMode);
  const {
    editorRef,
    formScrollRef,
    editorContentRef,
    editorReadyRef,
    editorFocusedRef,
    editorContentRequestRef,
    editorContent,
    isEditorFocused,
    isKeyboardVisible,
    shouldMountEditor,
    activeFormat,
    editorCommand,
    initialEditorHtml,
    scrollFormToEditor,
    clearEditorFocus,
    commitEditorContent,
    requestEditorContent,
    sendEditorCommand,
    toggleFormat,
    chooseColor,
  } = editorHook;

  // 3. Date Picker Hook
  const datePickerHook = useIncomingFormDatePicker(
    clearEditorFocus,
    () => resetMenusRef.current(),
    setFocusedField,
    setErrors
  );
  const {
    createdAtValue,
    finishedAtValue,
    finishedAtDisplay,
    showCreatedDatePicker,
    showFinishedDatePicker,
    datePickerDraft,
    datePickerError,
    openCreatedDatePicker,
    openFinishedDatePicker,
    closeDatePicker,
    applyRelativeDate,
    submitDatePickerDraft,
  } = datePickerHook;

  // We need to define a stable ref for resetMenus to break circular reference in hooks
  const resetMenusRef = useRef<() => void>(() => {});

  const ensureIncomingCategoryList = useCallback(() => {
    const categoryState = useDocumentCategoryStore.getState();
    if (categoryState.categories.length > 0) {
      return Promise.resolve();
    }
    if (categoryState.isLoading && !incomingCategoryListPromise) {
      return Promise.resolve();
    }
    if (incomingCategoryListPromise) {
      return incomingCategoryListPromise;
    }

    incomingCategoryListPromise = getCategoryList(undefined, { isFromNumbering: true })
      .finally(() => {
        incomingCategoryListPromise = null;
      });
    return incomingCategoryListPromise;
  }, [getCategoryList]);

  // 4. Assignment Hook
  const assignmentHook = useIncomingFormAssignment(
    categories,
    priorityValue,
    setPriorityValue,
    finishedAtValue,
    finishedAtDisplay,
    setErrors,
    showForm,
    showAssignSection,
    ensureIncomingCategoryList,
    clearEditorFocus,
    setFocusedField,
    editorFocusedRef,
    resetMenusRef,
    categoryIdValue,
    setCategoryIdValue,
    setCategoryNameValue
  );
  const {
    destinationSelectionIds,
    destinationCategoryHint,
    destinationLevelOptions,
    showCategoryMenu,
    showPriorityMenu,
    showLeadDepartmentMenu,
    showReceiveMenu,
    showSupportDepartmentMenu,
    showDestinationLevel,
    departmentOptions,
    isLoadingAssignmentOptions,
    destinationDropdownOptions,
    leadDepartmentDropdownOptions,
    receiveDropdownOptions,
    supportDepartmentDropdownOptions,
    categoryDropdownOptions,
    priorityDropdownOptions,
    selectDestinationOption,
    selectLeadDepartmentOption,
    toggleReceiveToKnowOption,
    toggleSupportDepartmentOption,
    selectCategoryOption,
    selectPriorityOption,
    selectedLeadDepartmentName,
    selectedReceiveToKnowText,
    selectedSupportDepartmentText,
    toggleMenu,
    toggleDestinationMenu,
    destinationPathLabel,
    supportDepartmentIds,
    receiveToKnowIds,
  } = assignmentHook;

  // Let's implement resetMenusRef value
  resetMenusRef.current = useCallback(() => {
    assignmentHook.setShowCategoryMenu(false);
    assignmentHook.setShowPriorityMenu(false);
    assignmentHook.setShowLeadDepartmentMenu(false);
    assignmentHook.setShowReceiveMenu(false);
    assignmentHook.setShowSupportDepartmentMenu(false);
    assignmentHook.setShowDestinationLevel(null);
    datePickerHook.setShowCreatedDatePicker(false);
    datePickerHook.setShowFinishedDatePicker(false);
    datePickerHook.setDatePickerDraft('');
    datePickerHook.setDatePickerError('');
    editorHook.setShowFormatMenu(false);
    editorHook.setShowColorMenu(false);
  }, [assignmentHook, datePickerHook, editorHook]);

  const resetMenus = resetMenusRef.current;

  // 5. Delete Hook
  const deleteHook = useIncomingFormDelete(deleteDocument, getListDocument, isLoading);
  const {
    deletingId,
    deletingTitle,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = deleteHook;

  // 6. Submit hook
  const submitHook = useIncomingFormSubmit(
    {
      showForm,
      setShowForm,
      formMode,
      setFormMode,
      editingId,
      setEditingId,
      isPreparingForm,
      setIsPreparingForm,
      isSubmittingForm,
      setIsSubmittingForm,
      titleValue,
      setTitleValue,
      organizationValue,
      setOrganizationValue,
      senderValue,
      setSenderValue,
      registeredNumberValue,
      setRegisteredNumberValue,
      categoryIdValue,
      setCategoryIdValue,
      categoryNameValue,
      setCategoryNameValue,
      priorityValue,
      setPriorityValue,
      focusedField,
      setFocusedField,
      errors,
      setErrors,
      isStationary,
    },
    filesHook,
    editorHook,
    datePickerHook,
    assignmentHook,
    deleteHook,
    ensureIncomingCategoryList,
    resetMenus,
  );
  const {
    resetForm,
    openCreateForm,
    startEdit,
    submitLayout1,
    submitLayout3,
    submitLayout4,
    startEditLockRef,
    submitLayout4LockRef,
  } = submitHook;

  const docs = useMemo<TIncomingItem[]>(
    () =>
      (listDocument || []).map((d: IDocument) => ({
        id: d._id,
        title: d.title || '',
        code: d.registeredNumber || '',
        statusLabel: mapIncomingStatusLabel(d.status),
        rawStatus: d.status,
        createdAt: d.createdAt ? String(d.createdAt) : undefined,
        finishedAt: d.finishedAt ? String(d.finishedAt) : undefined,
      })),
    [listDocument],
  );

  const activeTab = useMemo(() => tabs.find(t => t.key === activeTabKey) || tabs[0], [tabs, activeTabKey]);

  const filteredDocs = useMemo(() => {
    if (!activeTab) return docs;
    const normalizedSearch = searchText.trim().toLowerCase();
    return docs
      .filter(d => {
        if (!d.rawStatus) return false;
        if (activeTab.key === 'ALL') {
          return allowedStatusesByLevel.includes(d.rawStatus);
        }
        return activeTab.statuses.includes(d.rawStatus) && allowedStatusesByLevel.includes(d.rawStatus);
      })
      .filter(d => !normalizedSearch || `${d.title} ${d.code}`.toLowerCase().includes(normalizedSearch));
  }, [docs, activeTab, searchText, allowedStatusesByLevel]);

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

  useFocusEffect(
    useCallback(() => {
      if (!showForm) {
        getListDocument({ type: 'INCOMING' });
      }
    }, [getListDocument, showForm]),
  );

  useEffect(() => {
    if (!showForm) {
      return;
    }
    ensureIncomingCategoryList();
  }, [ensureIncomingCategoryList, showForm]);

  useEffect(() => {
    setActiveTabKey('ALL');
  }, [levelKey]);

  useEffect(() => {
    if (!tabs.some(tab => tab.key === activeTabKey)) {
      setActiveTabKey('ALL');
    }
  }, [tabs, activeTabKey]);

  useEffect(() => {
    if (!categoryIdValue || categoryNameValue || categories.length === 0) return;
    const matched = categories.find(category => category._id === categoryIdValue);
    if (matched?.name) {
      setCategoryNameValue(matched.name);
    }
  }, [categories, categoryIdValue, categoryNameValue]);

  useEffect(() => {
    if (!assignmentHook.leadDepartmentId) return;
    const matched = departmentOptions.find(dep => dep.id === assignmentHook.leadDepartmentId);
    if (matched?.name) {
      assignmentHook.setLeadAgencyValue(matched.name);
      assignmentHook.setLeadAgencyPayloadValue(matched.code || matched.id);
    }
  }, [assignmentHook.leadDepartmentId, departmentOptions, assignmentHook]);

  useEffect(() => {
    if (!assignmentHook.leadAgencyValue || assignmentHook.leadDepartmentId || departmentOptions.length === 0) return;
    const normalizedLeadAgency = String(assignmentHook.leadAgencyValue).trim();
    const matchedDepartment = departmentOptions.find(
      dep =>
        dep.id === normalizedLeadAgency ||
        String(dep.code || '').trim() === normalizedLeadAgency ||
        dep.name === normalizedLeadAgency,
    );
    if (matchedDepartment?.id) {
      assignmentHook.setLeadDepartmentId(matchedDepartment.id);
      assignmentHook.setLeadAgencyPayloadValue(matchedDepartment.code || matchedDepartment.id);
    }
  }, [assignmentHook.leadAgencyValue, assignmentHook.leadDepartmentId, departmentOptions, assignmentHook]);

  useEffect(() => {
    if (
      !showForm ||
      !destinationCategoryHint ||
      !isObjectId(destinationCategoryHint) ||
      !assignmentHook.categoryById[destinationCategoryHint]
    ) {
      return;
    }
    assignmentHook.setDestinationSelectionIds(buildCategoryPath(destinationCategoryHint, assignmentHook.categoryById));
    assignmentHook.setDestinationCategoryHint('');
  }, [assignmentHook.categoryById, destinationCategoryHint, showForm, assignmentHook]);

  return {
    activeFormat,
    activeTab,
    applyRelativeDate,
    attachedFilesNew,
    cancelDelete,
    canRemoveExistingMainFile,
    categoryDropdownOptions,
    categoryNameValue,
    chooseColor,
    closeDatePicker,
    commitEditorContent,
    confirmDelete,
    createdAtValue,
    datePickerDraft,
    datePickerError,
    deletingId,
    deletingTitle,
    destinationCategoryHint,
    destinationDropdownOptions,
    destinationLevelOptions,
    destinationPathLabel,
    destinationSelectionIds,
    dismissKeyboardAndMenus,
    docs,
    editorCommand,
    editorContentRef,
    editorContentRequestRef,
    editorFocusedRef,
    editorReadyRef,
    editorRef,
    editingId,
    errors,
    existingAttachedFiles,
    existingMainFiles,
    filteredDocs,
    finishedAtDisplay,
    focusedField,
    formMode,
    formScrollRef,
    handleInputFocus,
    handlePickAttachedFiles,
    handlePickMainFiles,
    handleRemoveExistingAttachedFile,
    handleRemoveExistingMainFile,
    handleRemoveNewAttachedFile,
    handleRemoveNewMainFile,
    isDeleting,
    isEditorFocused,
    isFormBusy,
    isKeyboardVisible,
    isLayout4,
    isLoading,
    isLoadingAssignmentOptions,
    isLoadingDestinationOptions,
    isPreparingForm,
    isStationary,
    initialEditorHtml,
    leadDepartmentDropdownOptions,
    mainFilesNew,
    openCreateForm,
    openCreatedDatePicker,
    openFinishedDatePicker,
    organizationInputRef,
    organizationValue,
    priorityDropdownOptions,
    priorityValue,
    receiveDropdownOptions,
    receiveToKnowIds,
    registeredNumberInputRef,
    registeredNumberValue,
    requestDelete,
    resetForm,
    resetMenus,
    scrollFormToEditor,
    searchText,
    selectCategoryOption,
    selectDestinationOption,
    selectLeadDepartmentOption,
    selectPriorityOption,
    selectedLeadDepartmentName,
    selectedReceiveToKnowText,
    selectedSupportDepartmentText,
    sendEditorCommand,
    senderInputRef,
    senderValue,
    setActiveTabKey,
    setDatePickerDraft: datePickerHook.setDatePickerDraft,
    setDatePickerError: datePickerHook.setDatePickerError,
    setErrors,
    setFocusedField,
    setInitialEditorHtml: editorHook.setInitialEditorHtml,
    setIsEditorFocused: editorHook.setIsEditorFocused,
    setOrganizationValue,
    setRegisteredNumberValue,
    setSearchText,
    setSenderValue,
    setShowCategoryMenu: assignmentHook.setShowCategoryMenu,
    setShowColorMenu: editorHook.setShowColorMenu,
    setShowForm,
    setShowFormatMenu: editorHook.setShowFormatMenu,
    setShowLeadDepartmentMenu: assignmentHook.setShowLeadDepartmentMenu,
    setShowPriorityMenu: assignmentHook.setShowPriorityMenu,
    setShowReceiveMenu: assignmentHook.setShowReceiveMenu,
    setShowSupportDepartmentMenu: assignmentHook.setShowSupportDepartmentMenu,
    setTitleValue,
    shouldMountEditor,
    showAssignSection,
    showCategoryMenu,
    showColorMenu: editorHook.showColorMenu,
    showCreatedDatePicker,
    showFinishedDatePicker,
    showForm,
    showFormatMenu: editorHook.showFormatMenu,
    showLeadDepartmentMenu,
    showPriorityMenu,
    showReceiveMenu,
    showRegisterSection,
    showSupportDepartmentMenu,
    showDestinationLevel,
    startEdit,
    submitDatePickerDraft,
    submitLayout1,
    submitLayout3,
    submitLayout4,
    supportDepartmentDropdownOptions,
    supportDepartmentIds,
    tabs,
    titleInputRef,
    titleValue,
    toggleDestinationMenu,
    toggleFormat,
    toggleMenu,
    toggleReceiveToKnowOption,
    toggleSupportDepartmentOption,
    startEditLockRef,
    submitLayout4LockRef,
  };
};
