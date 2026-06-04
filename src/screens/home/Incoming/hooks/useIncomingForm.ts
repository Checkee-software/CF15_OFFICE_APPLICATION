import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, InteractionManager, Keyboard, Platform, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { useAuthStore } from '@/stores/authStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { DOCUMENT_PRIORITY_LABEL, EDocumentPriority, EDocumentStatus } from '@/shared-types/common/Document/document';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import axiosClient from '@/utils/axiosClient';
import ENV from '@/config/ENV';
import {
  INCOMING_ALL_TABS,
  INCOMING_LEVEL_ALLOWED_STATUSES,
  buildCategoryById,
  buildCategoryPath,
  dedupeExistingFiles,
  formatDate,
  getEntityId,
  getEntityName,
  getLevelKey,
  inferFormMode,
  isObjectId,
  joinEntityNames,
  mapIncomingStatusLabel,
  normalizeDateInput,
  normalizeExistingFile,
  normalizeObjectIdList,
  normalizePrimitive,
  todayIsoDate,
  type TDepartmentOption,
  type TDirectoryUser,
  type TFocusableIncomingField,
  type TFormMode,
  type TIncomingAssignmentDraft,
  type TIncomingItem,
  type TPickedFile,
  type TTab,
  type TExistingFile,
} from '../utils';

export const useIncomingForm = () => {

  const { userInfo } = useAuthStore();
  const editorRef = useRef<any>(null);
  const formScrollRef = useRef<any>(null);
  const editorContentRef = useRef('');
  const editorReadyRef = useRef(false);
  const editorFocusedRef = useRef(false);
  const editorContentRequestRef = useRef<((html: string) => void) | null>(null);
  const hasLoadedAssignmentOptionsRef = useRef(false);
  const assignmentDraftsRef = useRef<Record<string, TIncomingAssignmentDraft>>({});
  const titleInputRef = useRef<TextInput>(null);
  const organizationInputRef = useRef<TextInput>(null);
  const senderInputRef = useRef<TextInput>(null);
  const registeredNumberInputRef = useRef<TextInput>(null);
  const {
    listDocument,
    getListDocument,
    getDocumentDetail,
    createIncomingDocument,
    updateIncomingDraft,
    registerIncomingDocument,
    assignIncomingDocument,
    deleteDocument,
    isLoading,
  } = useDocumentStore();
  const { categories, getCategoryList } = useDocumentCategoryStore();

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPreparingForm, setIsPreparingForm] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [titleValue, setTitleValue] = useState('');
  const [organizationValue, setOrganizationValue] = useState('');
  const [senderValue, setSenderValue] = useState('');
  const [registeredNumberValue, setRegisteredNumberValue] = useState('');
  const [createdAtValue, setCreatedAtValue] = useState(todayIsoDate());
  const [categoryIdValue, setCategoryIdValue] = useState('');
  const [categoryNameValue, setCategoryNameValue] = useState('');
  const [priorityValue, setPriorityValue] = useState<EDocumentPriority | ''>('');
  const [editorContent, setEditorContent] = useState('');

  const [destinationSelectionIds, setDestinationSelectionIds] = useState<string[]>([]);
  const [destinationCategoryHint, setDestinationCategoryHint] = useState('');
  const [leadDepartmentId, setLeadDepartmentId] = useState('');
  const [leadAgencyValue, setLeadAgencyValue] = useState('');
  const [leadAgencyPayloadValue, setLeadAgencyPayloadValue] = useState('');
  const [finishedAtValue, setFinishedAtValue] = useState('');
  const [finishedAtDisplay, setFinishedAtDisplay] = useState('');
  const [receiveToKnowIds, setReceiveToKnowIds] = useState<string[]>([]);
  const [supportDepartmentIds, setSupportDepartmentIds] = useState<string[]>([]);
  const [receiveToKnowTextFallback, setReceiveToKnowTextFallback] = useState('');
  const [supportDepartmentTextFallback, setSupportDepartmentTextFallback] = useState('');

  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLeadDepartmentMenu, setShowLeadDepartmentMenu] = useState(false);
  const [showReceiveMenu, setShowReceiveMenu] = useState(false);
  const [showSupportDepartmentMenu, setShowSupportDepartmentMenu] = useState(false);
  const [showDestinationLevel, setShowDestinationLevel] = useState<number | null>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showCreatedDatePicker, setShowCreatedDatePicker] = useState(false);
  const [showFinishedDatePicker, setShowFinishedDatePicker] = useState(false);
  const [datePickerDraft, setDatePickerDraft] = useState('');
  const [datePickerError, setDatePickerError] = useState('');
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [shouldMountEditor, setShouldMountEditor] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'Paragraph' | 'H1' | 'H2'>('Paragraph');
  const [editorCommand, setEditorCommand] = useState('');
  const [initialEditorHtml, setInitialEditorHtml] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<TFocusableIncomingField | null>(null);

  const [mainFilesNew, setMainFilesNew] = useState<TPickedFile[]>([]);
  const [attachedFilesNew, setAttachedFilesNew] = useState<TPickedFile[]>([]);
  const [existingMainFiles, setExistingMainFiles] = useState<TExistingFile[]>([]);
  const [existingAttachedFiles, setExistingAttachedFiles] = useState<TExistingFile[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  const [directoryUsers, setDirectoryUsers] = useState<TDirectoryUser[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<TDepartmentOption[]>([]);
  const [isLoadingAssignmentOptions, setIsLoadingAssignmentOptions] = useState(false);

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

  const showRegisterSection = formMode === 'LAYOUT_3' || formMode === 'LAYOUT_4';
  const showAssignSection = formMode === 'LAYOUT_3' || formMode === 'LAYOUT_4';
  const isLayout4 = formMode === 'LAYOUT_4';
  const isFormBusy = isPreparingForm || isSubmittingForm;

  const categoryById = useMemo<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    categories.forEach(category => {
      map[category._id] = category;
    });
    return map;
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter(category => !category.parentId),
    [categories],
  );

  const childrenByParent = useMemo<Record<string, any[]>>(() => {
    const map: Record<string, any[]> = {};
    categories.forEach(category => {
      if (!category.parentId) return;
      if (!map[category.parentId]) {
        map[category.parentId] = [];
      }
      map[category.parentId].push(category);
    });
    return map;
  }, [categories]);

  const destinationLevelOptions = useMemo(() => {
    const levels: any[][] = [rootCategories];
    for (let i = 0; i < destinationSelectionIds.length; i += 1) {
      const currentId = destinationSelectionIds[i];
      const nextLevel = childrenByParent[currentId] || [];
      if (nextLevel.length > 0) {
        levels.push(nextLevel);
      } else {
        break;
      }
    }
    return levels;
  }, [destinationSelectionIds, rootCategories, childrenByParent]);

  const selectedDestinationId = destinationSelectionIds[destinationSelectionIds.length - 1] || '';

  const destinationPathLabel = useMemo(() => {
    const names = destinationSelectionIds.map(id => categoryById[id]?.name).filter(Boolean);
    return names.join(' / ');
  }, [destinationSelectionIds, categoryById]);

  const selectedLeadDepartmentName = useMemo(() => {
    return departmentOptions.find(item => item.id === leadDepartmentId)?.name || leadAgencyValue || '';
  }, [departmentOptions, leadDepartmentId, leadAgencyValue]);

  const selectedLeadDepartmentOption = useMemo(() => {
    return departmentOptions.find(item => item.id === leadDepartmentId);
  }, [departmentOptions, leadDepartmentId]);

  const selectedReceiveToKnowText = useMemo(() => {
    if (receiveToKnowIds.length === 0) return receiveToKnowTextFallback || 'Chọn người nhận để biết';
    const names = receiveToKnowIds
      .map(id => directoryUsers.find(user => user._id === id)?.fullName)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : receiveToKnowTextFallback || 'Chọn người nhận để biết';
  }, [receiveToKnowIds, directoryUsers, receiveToKnowTextFallback]);

  const selectedSupportDepartmentText = useMemo(() => {
    if (supportDepartmentIds.length === 0) return supportDepartmentTextFallback || 'Chọn cơ quan để phối hợp(chọn nhiều)';
    const names = supportDepartmentIds
      .map(id => departmentOptions.find(dep => dep.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : supportDepartmentTextFallback || 'Chọn cơ quan để phối hợp(chọn nhiều)';
  }, [supportDepartmentIds, departmentOptions, supportDepartmentTextFallback]);

  const destinationDropdownOptions = useMemo(
    () =>
      destinationLevelOptions.map((options, levelIndex) =>
        options.map((option: any) => ({
          key: option._id,
          label: option.name || '',
          onPress: () => {
            setDestinationSelectionIds(prev => {
              const next = prev.slice(0, levelIndex);
              next[levelIndex] = option._id;
              return next;
            });
            setShowDestinationLevel(null);
            setErrors(prev => (
              prev.destinationCategoryId ? { ...prev, destinationCategoryId: undefined } : prev
            ));
          },
        })),
      ),
    [destinationLevelOptions],
  );

  const leadDepartmentDropdownOptions = useMemo(
    () =>
      departmentOptions.map(option => ({
        key: option.id,
        label: option.name,
        subLabel: option.code,
        onPress: () => {
          setLeadDepartmentId(option.id);
          setLeadAgencyValue(option.name);
          setLeadAgencyPayloadValue(option.code || option.id);
          setShowLeadDepartmentMenu(false);
          setErrors(prev => (
            prev.leadDepartmentId ? { ...prev, leadDepartmentId: undefined } : prev
          ));
        },
      })),
    [departmentOptions],
  );

  const receiveDropdownOptions = useMemo(
    () =>
      directoryUsers.map(user => ({
        key: user._id,
        label: user.fullName,
        subLabel: user.departmentName,
        checked: receiveToKnowIds.includes(user._id),
        onPress: () => {
          setReceiveToKnowIds(prev => (
            prev.includes(user._id) ? prev.filter(id => id !== user._id) : [...prev, user._id]
          ));
          setReceiveToKnowTextFallback('');
        },
      })),
    [directoryUsers, receiveToKnowIds],
  );

  const supportDepartmentDropdownOptions = useMemo(
    () =>
      departmentOptions.map(dep => ({
        key: dep.id,
        label: dep.name,
        subLabel: dep.code,
        checked: supportDepartmentIds.includes(dep.id),
        onPress: () => {
          setSupportDepartmentIds(prev => (
            prev.includes(dep.id) ? prev.filter(id => id !== dep.id) : [...prev, dep.id]
          ));
          setSupportDepartmentTextFallback('');
        },
      })),
    [departmentOptions, supportDepartmentIds],
  );

  const categoryDropdownOptions = useMemo(
    () =>
      categories.map(category => ({
        key: category._id,
        label: category.name || '',
        subLabel: (category as any).code || '',
        onPress: () => {
          setCategoryIdValue(category._id);
          setCategoryNameValue(category.name || '');
          setShowCategoryMenu(false);
          setErrors(prev => (
            prev.categoryId ? { ...prev, categoryId: undefined } : prev
          ));
        },
      })),
    [categories],
  );

  const priorityDropdownOptions = useMemo(
    () =>
      (Object.values(EDocumentPriority) as EDocumentPriority[]).map(priority => ({
        key: priority,
        label: DOCUMENT_PRIORITY_LABEL[priority],
        onPress: () => {
          setPriorityValue(priority);
          setShowPriorityMenu(false);
          setErrors(prev => (
            prev.priority ? { ...prev, priority: undefined } : prev
          ));
        },
      })),
    [],
  );

  const getReceiveToKnowNamesByIds = useCallback((ids: string[]) => {
    return ids
      .map(id => directoryUsers.find(user => user._id === id)?.fullName)
      .filter(Boolean)
      .join(', ');
  }, [directoryUsers]);

  const getSupportDepartmentNamesByIds = useCallback((ids: string[]) => {
    return ids
      .map(id => departmentOptions.find(dep => dep.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [departmentOptions]);

  const getLeadAgencyPayload = useCallback(() => {
    return (
      selectedLeadDepartmentOption?.code ||
      leadAgencyPayloadValue ||
      selectedLeadDepartmentOption?.id ||
      leadDepartmentId ||
      leadAgencyValue
    );
  }, [leadAgencyPayloadValue, leadAgencyValue, leadDepartmentId, selectedLeadDepartmentOption]);

  const buildCurrentAssignmentDraft = useCallback((): TIncomingAssignmentDraft => {
    const receiveNames = getReceiveToKnowNamesByIds(receiveToKnowIds);
    const supportNames = getSupportDepartmentNamesByIds(supportDepartmentIds);
    return {
      leadDepartmentId,
      leadAgencyValue: selectedLeadDepartmentName || leadAgencyValue,
      leadAgencyPayloadValue: getLeadAgencyPayload(),
      finishedAtValue,
      finishedAtDisplay: finishedAtDisplay || (finishedAtValue ? formatDate(finishedAtValue) : ''),
      receiveToKnowIds: [...receiveToKnowIds],
      supportDepartmentIds: [...supportDepartmentIds],
      receiveToKnowTextFallback: receiveNames || receiveToKnowTextFallback,
      supportDepartmentTextFallback: supportNames || supportDepartmentTextFallback,
    };
  }, [
    finishedAtDisplay,
    finishedAtValue,
    getReceiveToKnowNamesByIds,
    getSupportDepartmentNamesByIds,
    getLeadAgencyPayload,
    leadAgencyValue,
    leadDepartmentId,
    receiveToKnowIds,
    receiveToKnowTextFallback,
    selectedLeadDepartmentName,
    supportDepartmentIds,
    supportDepartmentTextFallback,
  ]);

  const scrollFormToEditor = useCallback((delay = 0) => {
    const scrollToEditor = () => {
      formScrollRef.current?.scrollToEnd?.(true);
      editorRef.current?.injectJavaScript('window.__ensureCaretVisible && window.__ensureCaretVisible();true;');
    };

    if (delay > 0) {
      setTimeout(scrollToEditor, delay);
      return;
    }

    requestAnimationFrame(scrollToEditor);
  }, []);

  const clearEditorFocus = useCallback(() => {
    if (!editorFocusedRef.current) return;
    editorFocusedRef.current = false;
    setIsEditorFocused(false);
    editorRef.current?.injectJavaScript(
      'document.activeElement && document.activeElement.blur && document.activeElement.blur();true;',
    );
  }, []);

  const commitEditorContent = useCallback((html: string, syncState = true) => {
    const nextHtml = html || '';
    editorContentRef.current = nextHtml;
    if (syncState) {
      setEditorContent(nextHtml);
    }
  }, []);

  const requestEditorContent = useCallback(() => {
    if (!editorRef.current) {
      return Promise.resolve(editorContentRef.current);
    }

    return new Promise<string>(resolve => {
      const timeout = setTimeout(() => {
        editorContentRequestRef.current = null;
        resolve(editorContentRef.current);
      }, 400);

      editorContentRequestRef.current = (html: string) => {
        clearTimeout(timeout);
        editorContentRequestRef.current = null;
        commitEditorContent(html);
        resolve(html || '');
      };

      editorRef.current.injectJavaScript(
        'window.__postContent && window.__postContent("request");true;',
      );
    });
  }, [commitEditorContent]);

  useEffect(() => {
    if (!showForm) return undefined;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      if (editorFocusedRef.current) {
        scrollFormToEditor(Platform.OS === 'ios' ? 120 : 220);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      clearEditorFocus();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [clearEditorFocus, scrollFormToEditor, showForm]);

  useEffect(() => {
    if (!showForm) {
      setShouldMountEditor(false);
      editorReadyRef.current = false;
      return undefined;
    }

    setShouldMountEditor(false);
    editorReadyRef.current = false;
    const task = InteractionManager.runAfterInteractions(() => {
      setShouldMountEditor(true);
    });

    return () => {
      task.cancel?.();
    };
  }, [editingId, formMode, showForm]);

  useFocusEffect(
    useCallback(() => {
      if (!showForm) {
        getListDocument({ type: 'INCOMING' });
      }
    }, [getListDocument, showForm]),
  );

  useEffect(() => {
    if (!showForm) return;
    getCategoryList(undefined, { isFromNumbering: true });
  }, [showForm, getCategoryList]);

  useEffect(() => {
    if (!showForm || !showAssignSection || hasLoadedAssignmentOptionsRef.current) return;
    let isCancelled = false;
    const loadDirectories = async () => {
      setIsLoadingAssignmentOptions(true);
      try {
        const normalizeList = (payload: any) => {
          if (Array.isArray(payload?.data?.data)) return payload.data.data;
          if (Array.isArray(payload?.data)) return payload.data;
          if (Array.isArray(payload)) return payload;
          return [];
        };

        const usersResponse = await axiosClient.get(`${ENV.BACKEND_URL}/resources/users/selection`);
        const users = normalizeList(usersResponse?.data);
        const mappedUsers: TDirectoryUser[] = users
          .map((user: any) => ({
            _id: String(user?._id || user?.id || user?.value || ''),
            fullName: String(user?.fullName || user?.name || user?.label || ''),
            departmentId: String(user?.userType?.department || user?.departmentId || ''),
            departmentName: String(user?.departmentName || user?.department?.name || ''),
          }))
          .filter((user: TDirectoryUser) => !!user._id && !!user.fullName)
          .sort((a: TDirectoryUser, b: TDirectoryUser) => a.fullName.localeCompare(b.fullName, 'vi'));

        // Nguồn "Người nhận để biết": danh sách user.
        if (isCancelled) return;
        setDirectoryUsers(mappedUsers);

        // Nguồn "Cơ quan phối hợp": ưu tiên endpoint phòng ban, fallback từ user list.
        let departmentData: TDepartmentOption[] = [];
        try {
          const departmentResponse = await axiosClient.get(`${ENV.BACKEND_URL}/resources/departments/selection`);
          const departments = normalizeList(departmentResponse?.data);
          departmentData = departments
            .map((dep: any) => ({
              id: String(dep?._id || dep?.id || dep?.value || ''),
              name: String(dep?.name || dep?.departmentName || dep?.label || ''),
              code: String(dep?.code || dep?.departmentCode || '').trim(),
            }))
            .filter((dep: TDepartmentOption) => !!dep.id && !!dep.name);
        } catch (error) {
        }

        if (departmentData.length === 0) {
          const depMap = new Map<string, string>();
          mappedUsers.forEach(user => {
            if (!user.departmentId) return;
            if (!depMap.has(user.departmentId)) {
              depMap.set(user.departmentId, user.departmentName || user.departmentId);
            }
          });
          departmentData = Array.from(depMap.entries()).map(([id, name]) => ({
            id,
            name,
            code: id,
          }));
        }

        departmentData.sort((a: TDepartmentOption, b: TDepartmentOption) => a.name.localeCompare(b.name, 'vi'));
        if (isCancelled) return;
        setDepartmentOptions(departmentData);
        hasLoadedAssignmentOptionsRef.current = true;
      } catch (error) {
      } finally {
        if (!isCancelled) {
          setIsLoadingAssignmentOptions(false);
        }
      }
    };
    loadDirectories();
    return () => {
      isCancelled = true;
    };
  }, [showAssignSection, showForm]);

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
    if (!leadDepartmentId) return;
    const matched = departmentOptions.find(dep => dep.id === leadDepartmentId);
    if (matched?.name) {
      setLeadAgencyValue(matched.name);
      setLeadAgencyPayloadValue(matched.code || matched.id);
    }
  }, [leadDepartmentId, departmentOptions]);

  useEffect(() => {
    if (!leadAgencyValue || leadDepartmentId || departmentOptions.length === 0) return;
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
  }, [leadAgencyValue, leadDepartmentId, departmentOptions]);

  useEffect(() => {
    if (
      !showForm ||
      !destinationCategoryHint ||
      !isObjectId(destinationCategoryHint) ||
      !categoryById[destinationCategoryHint]
    ) {
      return;
    }
    setDestinationSelectionIds(buildCategoryPath(destinationCategoryHint, categoryById));
    setDestinationCategoryHint('');
  }, [categoryById, destinationCategoryHint, showForm]);

  const sendEditorCommand = (command: string) => {
    setEditorCommand(`${command}|${Date.now()}`);
  };

  const toggleFormat = (format: 'Paragraph' | 'H1' | 'H2') => {
    setActiveFormat(format);
    const block = format === 'Paragraph' ? 'P' : format;
    sendEditorCommand(`formatBlock:${block}`);
    setShowFormatMenu(false);
  };

  const chooseColor = (color: string) => {
    sendEditorCommand(`foreColor:${color}`);
    setShowColorMenu(false);
  };

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

  const resetMenus = useCallback(() => {
    setShowCategoryMenu(false);
    setShowPriorityMenu(false);
    setShowLeadDepartmentMenu(false);
    setShowReceiveMenu(false);
    setShowSupportDepartmentMenu(false);
    setShowDestinationLevel(null);
    setShowFormatMenu(false);
    setShowColorMenu(false);
    setShowCreatedDatePicker(false);
    setShowFinishedDatePicker(false);
    setDatePickerDraft('');
    setDatePickerError('');
  }, []);

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

  const toggleMenu = (
    isOpen: boolean,
    setMenu: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    const shouldOpen = !isOpen;
    if (focusedField || editorFocusedRef.current) {
      Keyboard.dismiss();
    }
    clearEditorFocus();
    setFocusedField(null);
    resetMenus();
    setMenu(shouldOpen);
  };

  const toggleDestinationMenu = (levelIndex: number) => {
    const shouldOpen = showDestinationLevel !== levelIndex;
    if (focusedField || editorFocusedRef.current) {
      Keyboard.dismiss();
    }
    clearEditorFocus();
    setFocusedField(null);
    resetMenus();
    setShowDestinationLevel(shouldOpen ? levelIndex : null);
  };

  const openCreatedDatePicker = () => {
    Keyboard.dismiss();
    clearEditorFocus();
    resetMenus();
    setFocusedField('createdAt');
    setDatePickerDraft(formatDate(createdAtValue));
    setDatePickerError('');
    setShowCreatedDatePicker(true);
  };

  const openFinishedDatePicker = () => {
    Keyboard.dismiss();
    clearEditorFocus();
    resetMenus();
    setFocusedField('finishedAt');
    setDatePickerDraft(finishedAtDisplay || (finishedAtValue ? formatDate(finishedAtValue) : ''));
    setDatePickerError('');
    setShowFinishedDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowCreatedDatePicker(false);
    setShowFinishedDatePicker(false);
    setDatePickerDraft('');
    setDatePickerError('');
    setFocusedField(null);
  };

  const applyDateValue = (iso: string) => {
    if (showCreatedDatePicker) {
      setCreatedAtValue(iso);
    }
    if (showFinishedDatePicker) {
      setFinishedAtValue(iso);
      setFinishedAtDisplay(formatDate(iso));
      setErrors(prev => ({ ...prev, finishedAt: undefined }));
    }
    closeDatePicker();
  };

  const submitDatePickerDraft = () => {
    const iso = normalizeDateInput(datePickerDraft);
    if (!iso) {
      setDatePickerError('Ngày không hợp lệ. Vui lòng nhập dạng DD/MM/YYYY.');
      return;
    }
    applyDateValue(iso);
  };

  const applyRelativeDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    applyDateValue(`${yyyy}-${mm}-${dd}`);
  };



  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormMode('CREATE');
    setTitleValue('');
    setOrganizationValue('');
    setSenderValue('');
    setRegisteredNumberValue('');
    setCreatedAtValue(todayIsoDate());
    setCategoryIdValue('');
    setCategoryNameValue('');
    setPriorityValue('');
    commitEditorContent('');
    setInitialEditorHtml('');
    editorReadyRef.current = false;
    editorFocusedRef.current = false;
    editorContentRequestRef.current = null;
    setIsEditorFocused(false);
    setIsKeyboardVisible(false);
    setActiveFormat('Paragraph');
    setMainFilesNew([]);
    setAttachedFilesNew([]);
    setExistingMainFiles([]);
    setExistingAttachedFiles([]);
    setFilesToRemove([]);
    setDestinationSelectionIds([]);
    setDestinationCategoryHint('');
    setLeadDepartmentId('');
    setLeadAgencyValue('');
    setLeadAgencyPayloadValue('');
    setFinishedAtValue('');
    setFinishedAtDisplay('');
    setReceiveToKnowIds([]);
    setSupportDepartmentIds([]);
    setReceiveToKnowTextFallback('');
    setSupportDepartmentTextFallback('');
    setShowCreatedDatePicker(false);
    setShowFinishedDatePicker(false);
    setIsSubmittingForm(false);
    setFocusedField(null);
    setErrors({});
    resetMenus();
  }, [commitEditorContent, resetMenus]);

  const openCreateForm = useCallback(() => {
    if (isPreparingForm) return;
    resetForm();
    setFormMode('CREATE');
    setShowForm(true);
  }, [isPreparingForm, resetForm]);
  
  const startEdit = async (id: string, forcedMode?: Exclude<TFormMode, 'CREATE'>) => {
    if (isPreparingForm) return;
    resetForm();
    setEditingId(id);
    setFormMode(forcedMode || 'LAYOUT_1');
    setIsPreparingForm(true);
    try {
      let latestCategoryById = categoryById;
      const detailPromise = getDocumentDetail(id);
      await getCategoryList(undefined, { isFromNumbering: true });
      const numberingCategoryById = buildCategoryById(useDocumentCategoryStore.getState().categories);
      if (Object.keys(numberingCategoryById).length > 0) {
        latestCategoryById = numberingCategoryById;
      }

      const detail = await detailPromise;
      if (!detail) {
        setShowForm(false);
        resetForm();
        return;
      }
      const sourceDocRaw: IDocument | { document?: IDocument | null } | null =
        (detail as IDocument | { document?: IDocument | null } | null) || null;
      const doc =
        sourceDocRaw &&
          typeof sourceDocRaw === 'object' &&
          'document' in sourceDocRaw &&
          sourceDocRaw.document &&
          typeof sourceDocRaw.document === 'object'
          ? sourceDocRaw.document
          : (sourceDocRaw as IDocument);
      const mode = forcedMode || inferFormMode(doc, isStationary);

      setEditingId(id);
      setFormMode(mode);
      setTitleValue((doc.title || '').trimStart());
      setOrganizationValue((doc.organization || '').trimStart());
      setSenderValue((doc.sender || '').trimStart());
      setRegisteredNumberValue((doc.registeredNumber || '').trimStart());
      const sourceStartAt = (doc as any).startAt || doc.createdAt || '';
      setCreatedAtValue(normalizeDateInput(String(sourceStartAt)) || todayIsoDate());
      const normalizedCategoryId =
        typeof doc.categoryId === 'object' && doc.categoryId
          ? doc.categoryId._id || ''
          : (doc.categoryId || '');
      const normalizedCategoryName =
        doc.categoryDocumentName ||
        (typeof doc.categoryId === 'object' && doc.categoryId
          ? (doc.categoryId.name || '')
          : latestCategoryById[normalizedCategoryId]?.name || '');
      setCategoryIdValue(normalizedCategoryId);
      setCategoryNameValue(normalizedCategoryName);
      setPriorityValue((doc.priority as EDocumentPriority) || '');
      const finishedIso = normalizeDateInput(String(doc.finishedAt || ''));
      setFinishedAtValue(finishedIso);
      setFinishedAtDisplay(finishedIso ? formatDate(finishedIso) : '');
      const detailContent = (doc.content || '').trimStart();
      commitEditorContent(detailContent);
      setInitialEditorHtml(detailContent);
      setActiveFormat('Paragraph');
      resetMenus();
      setMainFilesNew([]);
      setAttachedFilesNew([]);
      setFilesToRemove([]);
      setErrors({});

      const mainFilesFromMain = Array.isArray(doc.mainFiles) ? doc.mainFiles : [];
      const mainFilesFromSigned = Array.isArray(doc.signedFiles) ? doc.signedFiles : [];
      const mergedAttachedFiles = Array.isArray(doc.attachedFiles) ? doc.attachedFiles : [];

      setExistingMainFiles(
        dedupeExistingFiles([
          ...mainFilesFromMain.map((f: any, index: number) =>
            normalizeExistingFile(f, 'main', index + 1, 'mainFiles'),
          ),
          ...mainFilesFromSigned.map((f: any, index: number) =>
            normalizeExistingFile(f, 'signed', index + 1, 'signedFiles'),
          ),
        ]),
      );

      setExistingAttachedFiles(
        mergedAttachedFiles.map((f: any, index: number) =>
          normalizeExistingFile(f, 'attached', index + 1, 'attachedFiles'),
        ),
      );

      const destinationRaw: any = doc.destinationCategoryId;
      const normalizedDestinationId =
        typeof destinationRaw === 'object' && destinationRaw
          ? String(destinationRaw._id || destinationRaw.id || '')
          : String(destinationRaw || '');
      if (
        isObjectId(normalizedDestinationId) &&
        latestCategoryById[normalizedDestinationId]
      ) {
        setDestinationSelectionIds(buildCategoryPath(normalizedDestinationId, latestCategoryById));
        setDestinationCategoryHint('');
      } else {
        setDestinationSelectionIds([]);
        setDestinationCategoryHint(
          typeof destinationRaw === 'object' && destinationRaw
            ? String(destinationRaw.name || destinationRaw.title || normalizedDestinationId || '')
            : normalizedDestinationId,
        );
      }

      const leadDepartmentRaw: any =
        (doc as any).receiveDepartmentId ||
        (doc as any).receiveDepartment ||
        (doc as any).departmentId ||
        (doc as any).department ||
        (doc as any).leadAgency ||
        '';
      const normalizedLeadDepartmentId = getEntityId(leadDepartmentRaw);
      const normalizedLeadDepartmentName =
        getEntityName(leadDepartmentRaw) ||
        getEntityName((doc as any).receiveDepartment) ||
        getEntityName((doc as any).receiveDepartmentId) ||
        getEntityName((doc as any).leadAgency) ||
        getEntityName((doc as any).leadDepartment) ||
        getEntityName((doc as any).leadDepartmentId) ||
        normalizePrimitive((doc as any).leadAgencyName) ||
        normalizePrimitive((doc as any).receiveDepartmentName) ||
        (!isObjectId(normalizedLeadDepartmentId) ? normalizedLeadDepartmentId : '');
      setLeadDepartmentId(isObjectId(normalizedLeadDepartmentId) ? normalizedLeadDepartmentId : '');
      setLeadAgencyValue(normalizedLeadDepartmentName);
      setLeadAgencyPayloadValue(normalizePrimitive((doc as any).leadAgency));

      const receiveIds = normalizeObjectIdList(
        (doc as any).receiveToKnow ||
        (doc as any).receiveToKnowIds ||
        (doc as any).receiveToKnowDepartments,
      );
      const receiveFallback = joinEntityNames(
        (doc as any).receiveToKnow,
        (doc as any).receiveToKnowIds,
        (doc as any).receiveToKnowDepartments,
        (doc as any).receiveToKnowUsers,
        (doc as any).receiveToKnowNames,
      );
      setReceiveToKnowIds(receiveIds);
      setReceiveToKnowTextFallback(receiveFallback);

      const supportIds = normalizeObjectIdList(
        (doc as any).supportDepartmentId ||
        (doc as any).supportDepartmentIds ||
        (doc as any).supportDepartments,
      );
      const supportFallback = joinEntityNames(
        (doc as any).supportDepartmentId,
        (doc as any).supportDepartmentIds,
        (doc as any).supportDepartments,
        (doc as any).supportDepartmentNames,
      );
      setSupportDepartmentIds(supportIds);
      setSupportDepartmentTextFallback(supportFallback);

      const cachedAssignmentDraft = assignmentDraftsRef.current[id];
      if (mode === 'LAYOUT_4' && cachedAssignmentDraft) {
        if (!normalizedLeadDepartmentId && !normalizedLeadDepartmentName) {
          setLeadDepartmentId(cachedAssignmentDraft.leadDepartmentId);
          setLeadAgencyValue(cachedAssignmentDraft.leadAgencyValue);
          setLeadAgencyPayloadValue(cachedAssignmentDraft.leadAgencyPayloadValue);
        }
        if (!finishedIso) {
          setFinishedAtValue(cachedAssignmentDraft.finishedAtValue);
          setFinishedAtDisplay(cachedAssignmentDraft.finishedAtDisplay);
        }
        if (receiveIds.length === 0 && !receiveFallback) {
          setReceiveToKnowIds(cachedAssignmentDraft.receiveToKnowIds);
          setReceiveToKnowTextFallback(cachedAssignmentDraft.receiveToKnowTextFallback);
        }
        if (supportIds.length === 0 && !supportFallback) {
          setSupportDepartmentIds(cachedAssignmentDraft.supportDepartmentIds);
          setSupportDepartmentTextFallback(cachedAssignmentDraft.supportDepartmentTextFallback);
        }
      }

      setShowForm(true);
    } finally {
      setIsPreparingForm(false);
    }
  };

  const handlePickMainFiles = async () => {
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
      setErrors(prev => ({ ...prev, mainFiles: undefined }));
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
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
      setErrors(prev => ({ ...prev, attachedFiles: undefined }));
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Lỗi chọn file', 'Thiếu module chọn file trong bản build hiện tại. Vui lòng build lại ứng dụng.');
    }
  };

  const handleRemoveExistingMainFile = (file: TExistingFile) => {
    setExistingMainFiles(prev => prev.filter(item => item.fileKey !== file.fileKey));
    if (file.filename) {
      setFilesToRemove(prev => (prev.includes(file.filename) ? prev : [...prev, file.filename]));
    }
  };

  const handleRemoveExistingAttachedFile = (file: TExistingFile) => {
    setExistingAttachedFiles(prev => prev.filter(item => item.fileKey !== file.fileKey));
    if (file.filename) {
      setFilesToRemove(prev => (prev.includes(file.filename) ? prev : [...prev, file.filename]));
    }
  };

  const canRemoveExistingMainFile = (file: TExistingFile) =>
    file.source === 'signedFiles' || formMode === 'LAYOUT_1';

  const appendBaseFields = (
    formData: FormData,
    statusValue?: EDocumentStatus,
    contentOverride?: string,
  ) => {
    formData.append('title', titleValue.trim());
    formData.append('organization', organizationValue.trim());
    formData.append('sender', senderValue.trim());
    formData.append('registeredNumber', registeredNumberValue.trim());
    if (statusValue) {
      formData.append('status', statusValue);
    }
    formData.append('priority', priorityValue);
    formData.append('categoryId', categoryIdValue);
    const contentValue = contentOverride ?? editorContentRef.current;
    formData.append('content', (contentValue || editorContent || titleValue).trim());
    formData.append('createdAt', createdAtValue);
    formData.append('startAt', createdAtValue);
  };

  const appendFilesForDraftCreate = (formData: FormData) => {
    mainFilesNew.forEach((file, index) => {
      formData.append('mainFiles', {
        uri: file.uri,
        name: file.name || `main-file-${index}.pdf`,
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
  };

  const appendFilesForRegisterFlow = (formData: FormData) => {
    mainFilesNew.forEach((file, index) => {
      formData.append('mainFiles', {
        uri: file.uri,
        name: file.name || `main-file-${index}.pdf`,
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
  };

  const validateBaseFields = (nextErrors: any) => {
    if (!titleValue.trim()) nextErrors.title = 'Bắt buộc!';
    if (!organizationValue.trim()) nextErrors.organization = 'Bắt buộc!';
    if (!registeredNumberValue.trim()) nextErrors.registeredNumber = 'Bắt buộc!';
    if (!categoryIdValue) nextErrors.categoryId = 'Vui lòng chọn!';
    if (!priorityValue) nextErrors.priority = 'Vui lòng chọn!';
  };

  const validateDraftFields = (nextErrors: any) => {
    validateBaseFields(nextErrors);
    if (!senderValue.trim()) nextErrors.sender = 'Bắt buộc!';
  };

  const validateRegisterOnlyFields = (nextErrors: any) => {
    if (!selectedDestinationId) nextErrors.destinationCategoryId = 'Vui lòng chọn!';
  };

  const validateAssignFields = (nextErrors: any) => {
    if (!leadDepartmentId) nextErrors.leadDepartmentId = 'Vui lòng chọn!';
    if (!finishedAtValue) nextErrors.finishedAt = 'Vui lòng chọn ngày!';
  };

  const submitLayout1 = async (asDraft: boolean) => {
    if (isSubmittingForm) return;
    Keyboard.dismiss();
    clearEditorFocus();
    setFocusedField(null);
    const nextErrors: any = {};
    validateDraftFields(nextErrors);

    const totalMainFiles = mainFilesNew.length + existingMainFiles.length;
    if (!editingId && totalMainFiles === 0) nextErrors.mainFiles = 'Vui lòng tải lên ít nhất 1 file văn bản chính!';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmittingForm(true);
    try {
      const latestEditorContent = await requestEditorContent();
      const formData = new FormData();
      const statusForSubmit = asDraft
        ? EDocumentStatus.DRAFT
        : EDocumentStatus.STATIONARY_RECEIVED;
      appendBaseFields(formData, statusForSubmit, latestEditorContent);
      appendFilesForDraftCreate(formData);
      if (editingId) {
        formData.append('filesToRemove', JSON.stringify(filesToRemove));
      }

      const ok = editingId ? await updateIncomingDraft(editingId, formData) : await createIncomingDocument(formData);
      if (!ok) return;
      setShowForm(false);
      resetForm();
      getListDocument({ type: 'INCOMING' });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const buildRegisterFormData = (contentOverride?: string) => {
    const formData = new FormData();
    appendBaseFields(formData, undefined, contentOverride);
    formData.append('destinationCategoryId', selectedDestinationId);
    formData.append('leadAgency', getLeadAgencyPayload());
    formData.append('receiveDepartmentId', leadDepartmentId);
    formData.append('finishedAt', finishedAtValue);
    formData.append('receiveToKnow', JSON.stringify(receiveToKnowIds));
    formData.append('supportDepartmentId', JSON.stringify(supportDepartmentIds));
    formData.append('filesToRemove', JSON.stringify(filesToRemove));
    appendFilesForRegisterFlow(formData);
    return formData;
  };

  const buildAssignFormData = (
    options?: { includeFiles?: boolean; includeFilesToRemove?: boolean },
    contentOverride?: string,
  ) => {
    const formData = new FormData();
    appendBaseFields(formData, undefined, contentOverride);
    if (selectedDestinationId) {
      formData.append('destinationCategoryId', selectedDestinationId);
    }
    formData.append('leadAgency', getLeadAgencyPayload());
    formData.append('receiveDepartmentId', leadDepartmentId);
    formData.append('finishedAt', finishedAtValue);
    formData.append('receiveToKnow', JSON.stringify(receiveToKnowIds));
    formData.append('supportDepartmentId', JSON.stringify(supportDepartmentIds));
    formData.append(
      'filesToRemove',
      JSON.stringify(options?.includeFilesToRemove === false ? [] : filesToRemove),
    );
    if (options?.includeFiles) {
      appendFilesForRegisterFlow(formData);
    }
    return formData;
  };

  const submitLayout3 = async () => {
    if (!editingId) return;
    if (isSubmittingForm) return;
    Keyboard.dismiss();
    clearEditorFocus();
    setFocusedField(null);
    const nextErrors: any = {};
    validateBaseFields(nextErrors);
    validateRegisterOnlyFields(nextErrors);
    validateAssignFields(nextErrors);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmittingForm(true);
    try {
      const latestEditorContent = await requestEditorContent();
      const ok = await registerIncomingDocument(editingId, buildRegisterFormData(latestEditorContent));
      if (!ok) return;
      assignmentDraftsRef.current[editingId] = buildCurrentAssignmentDraft();
      setShowForm(false);
      resetForm();
      getListDocument({ type: 'INCOMING' });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const submitLayout4 = async () => {
    if (!editingId) return;
    if (isSubmittingForm) return;
    Keyboard.dismiss();
    clearEditorFocus();
    setFocusedField(null);
    const nextErrors: any = {};
    validateBaseFields(nextErrors);
    validateAssignFields(nextErrors);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmittingForm(true);
    try {
      const latestEditorContent = await requestEditorContent();
      const ok = await assignIncomingDocument(
        editingId,
        buildAssignFormData({ includeFiles: true, includeFilesToRemove: true }, latestEditorContent),
      );
      if (!ok) return;
      delete assignmentDraftsRef.current[editingId];
      setShowForm(false);
      resetForm();
      getListDocument({ type: 'INCOMING' });
    } finally {
      setIsSubmittingForm(false);
    }
  };



  const handleRemoveNewMainFile = useCallback((file: TPickedFile) => {
    setMainFilesNew(prev => prev.filter(item => item.uri !== file.uri));
  }, []);

  const handleRemoveNewAttachedFile = useCallback((file: TPickedFile) => {
    setAttachedFilesNew(prev => prev.filter(item => item.uri !== file.uri));
  }, []);

  const requestDelete = useCallback((id: string, title: string) => {
    setDeletingId(id);
    setDeletingTitle(title || '');
  }, []);

  const cancelDelete = useCallback(() => {
    setDeletingId(null);
    setDeletingTitle('');
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId || isDeleting || isLoading) return;
    setIsDeleting(true);
    await deleteDocument(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
    setDeletingTitle('');
    getListDocument({ type: 'INCOMING' });
  }, [deleteDocument, deletingId, getListDocument, isDeleting, isLoading]);

  return {
    activeFormat,
    activeTab,
    activeTabKey,
    applyRelativeDate,
    attachedFilesNew,
    cancelDelete,
    canRemoveExistingMainFile,
    categoryDropdownOptions,
    categoryNameValue,
    chooseColor,
    clearEditorFocus,
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
    isPreparingForm,
    isStationary,
    isSubmittingForm,
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
    registeredNumberInputRef,
    registeredNumberValue,
    requestDelete,
    resetForm,
    resetMenus,
    scrollFormToEditor,
    searchText,
    selectedLeadDepartmentName,
    selectedReceiveToKnowText,
    selectedSupportDepartmentText,
    sendEditorCommand,
    senderInputRef,
    senderValue,
    setActiveTabKey,
    setAttachedFilesNew,
    setDatePickerDraft,
    setDatePickerError,
    setErrors,
    setFinishedAtDisplay,
    setFinishedAtValue,
    setFocusedField,
    setInitialEditorHtml,
    setIsEditorFocused,
    setLeadDepartmentId,
    setMainFilesNew,
    setOrganizationValue,
    setRegisteredNumberValue,
    setSearchText,
    setSenderValue,
    setShowCategoryMenu,
    setShowColorMenu,
    setShowFinishedDatePicker,
    setShowForm,
    setShowFormatMenu,
    setShowLeadDepartmentMenu,
    setShowPriorityMenu,
    setShowReceiveMenu,
    setShowSupportDepartmentMenu,
    setTitleValue,
    shouldMountEditor,
    showAssignSection,
    showCategoryMenu,
    showColorMenu,
    showCreatedDatePicker,
    showFinishedDatePicker,
    showForm,
    showFormatMenu,
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
    tabs,
    titleInputRef,
    titleValue,
    toggleDestinationMenu,
    toggleFormat,
    toggleMenu,
  };

};
