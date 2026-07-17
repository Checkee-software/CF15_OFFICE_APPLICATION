import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useAuthStore } from '@/stores/authStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import { EDocumentPriority, ESignDepartment } from '../components/constants';
import type { TExistingFile, TOutgoingItem, TPickedFile } from '../types';
import {
  asArray,
  dedupeExistingFiles,
  getLevelKey,
  getOutgoingStatusDisplay,
  normalizeExistingFile,
  pickByType,
  resolveCreatorDepartmentCode,
} from '../utils/index';
import axiosClient from '@/utils/axiosClient';
import ENV from '@/config/ENV';
import { IDepartmentSelection } from '@/shared-types/Response/DepartmentResponse/DepartmentResponse';

export function useOutgoingForm() {
  const { userInfo } = useAuthStore();
  const createScrollRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const editorReadyRef = useRef(false);
  const editorFocusedRef = useRef(false);
  const editorContentRequestRef = useRef<((html: string) => void) | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [editorCommand, setEditorCommand] = useState('');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'Paragraph' | 'H1' | 'H2'>('Paragraph');
  const { listDocument, getListDocument, createOutgoingDocument, updateOutgoingDocument, getDocumentDetail, deleteDocument, isLoading } = useDocumentStore();
  const [documents, setDocuments] = useState<TOutgoingItem[]>([]);
  const [editingDocument, setEditingDocument] = useState<TOutgoingItem | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<TOutgoingItem | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [codeValue, setCodeValue] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorContentVersion, setEditorContentVersion] = useState(0);
  const editorContentRef = useRef('');
  const [signedFilesNew, setSignedFilesNew] = useState<TPickedFile[]>([]);
  const [attachedFilesNew, setAttachedFilesNew] = useState<TPickedFile[]>([]);
  const [existingSignedFiles, setExistingSignedFiles] = useState<TExistingFile[]>([]);
  const [existingAttachedFiles, setExistingAttachedFiles] = useState<TExistingFile[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [priorityValue, setPriorityValue] = useState<EDocumentPriority | ''>('');
  const [signedDepartmentValue, setSignedDepartmentValue] = useState<ESignDepartment | ''>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState<{ priority?: string; signedDepartment?: string; signedFiles?: string; title?: string; categoryId?: string; registeredNumber?: string }>({});
  const [isPreparingForm, setIsPreparingForm] = useState(false);

  // Signer / Approver selection
  type TSignerUser = { _id: string; fullName: string };
  const [signerUserList, setSignerUserList] = useState<TSignerUser[]>([]);
  const [approverUserList, setApproverUserList] = useState<TSignerUser[]>([]);
  const [isFetchingSigners, setIsFetchingSigners] = useState(false);
  const [selectedSignerUserId, setSelectedSignerUserId] = useState('');
  const [selectedSignerUserName, setSelectedSignerUserName] = useState('');
  const [selectedApproverUserId, setSelectedApproverUserId] = useState('');
  const [selectedApproverUserName, setSelectedApproverUserName] = useState('');

  // Receive department selection
  const [departmentList, setDepartmentList] = useState<IDepartmentSelection[]>([]);
  const [isFetchingDepartments, setIsFetchingDepartments] = useState(false);
  const [selectedReceiveDeptId, setSelectedReceiveDeptId] = useState('');
  const [selectedReceiveDeptName, setSelectedReceiveDeptName] = useState('');
  const { categories, getCategoryList } = useDocumentCategoryStore();
  const currentUserLevel = userInfo?.userType?.level as EOrganization | undefined;
  const levelKey = getLevelKey(userInfo?.userType?.level as EOrganization | undefined);
  const creatorDepartmentCode = useMemo(
    () => resolveCreatorDepartmentCode(userInfo as any),
    [userInfo],
  );
  const isLeaderLevel = currentUserLevel === EOrganization.LEADER;
  const isDepartmentLevel = currentUserLevel === EOrganization.DEPARTMENT;
  const isStationaryLevel = currentUserLevel === EOrganization.STATIONARY;
  const canMutateOutgoing = isStationaryLevel || isDepartmentLevel || isLeaderLevel;

  // Keep track of the parameters used for fetching to prevent duplicate network calls / state resets
  const lastFetchedParamsRef = useRef({ deptId: '', dept: '' });

  // Fetch danh sách phòng ban nhận
  const fetchDepartments = useCallback(async () => {
    setIsFetchingDepartments(true);
    try {
      const res = await axiosClient.get(`${ENV.BACKEND_URL}/resources/departments/selection`);
      const list: IDepartmentSelection[] = (res.data?.data || []).map((d: any) => ({
        _id: d._id || '',
        name: d.name || '',
        code: d.code || '',
      }));
      setDepartmentList(list);
      return list;
    } catch (e) {
      console.log('[useOutgoingForm] fetchDepartments error', e);
      setDepartmentList([]);
      return [];
    } finally {
      setIsFetchingDepartments(false);
    }
  }, []);

  // Fetch danh sách người ký theo bộ phận + loại ký duyệt
  const fetchSignerUsers = useCallback(async (
    deptId: string,
    dept: ESignDepartment,
    currentSignerId?: string,
    currentApproverId?: string
  ) => {
    if (!deptId) { return []; }
    setIsFetchingSigners(true);
    try {
      const res = await axiosClient.get(
        `${ENV.BACKEND_URL}/resources/users/selection-user-by-department`,
        { params: { departmentId: deptId, signedDepartment: dept } },
      );
      const payload = res.data?.data?.data;

      lastFetchedParamsRef.current = { deptId, dept };

      if (dept === ESignDepartment.MANAGEMENT) {
        const initialSigners: TSignerUser[] = (payload?.initialSigners || []).map((u: any) => ({
          _id: u._id || '',
          fullName: u.fullName || u.username || '',
        }));
        const approvers: TSignerUser[] = (payload?.approvers || []).map((u: any) => ({
          _id: u._id || '',
          fullName: u.fullName || u.username || '',
        }));

        setSignerUserList(initialSigners);
        setApproverUserList(approvers);

        if (currentSignerId) {
          const found = initialSigners.find(u => u._id === currentSignerId);
          if (found) {
            setSelectedSignerUserName(found.fullName);
          } else {
            setSelectedSignerUserId('');
            setSelectedSignerUserName('');
          }
        }
        if (currentApproverId) {
          const found = approvers.find(u => u._id === currentApproverId);
          if (found) {
            setSelectedApproverUserName(found.fullName);
          } else {
            setSelectedApproverUserId('');
            setSelectedApproverUserName('');
          }
        }
        return { initialSigners, approvers };
      } else {
        const approvers: TSignerUser[] = (payload?.approvers || []).map((u: any) => ({
          _id: u._id || '',
          fullName: u.fullName || u.username || '',
        }));

        setSignerUserList(approvers);
        setApproverUserList([]);

        if (currentSignerId) {
          const found = approvers.find(u => u._id === currentSignerId);
          if (found) {
            setSelectedSignerUserName(found.fullName);
          } else {
            setSelectedSignerUserId('');
            setSelectedSignerUserName('');
          }
        }
        setSelectedApproverUserId('');
        setSelectedApproverUserName('');
        return { approvers };
      }
    } catch (e) {
      console.log('[useOutgoingForm] fetchSignerUsers error', e);
      setSignerUserList([]);
      setApproverUserList([]);
      return [];
    } finally {
      setIsFetchingSigners(false);
    }
  }, []);

  // Tự động fetch khi signedDepartment thay đổi và đã có departmentId
  useEffect(() => {
    if (!signedDepartmentValue || !userInfo?.userType?.department) { return; }

    // Only fetch if department or signed department type actually changed
    if (
      lastFetchedParamsRef.current.deptId !== userInfo.userType.department ||
      lastFetchedParamsRef.current.dept !== signedDepartmentValue
    ) {
      fetchSignerUsers(
        userInfo.userType.department,
        signedDepartmentValue as ESignDepartment,
        selectedSignerUserId,
        selectedApproverUserId
      );
    }
  }, [
    signedDepartmentValue,
    userInfo?.userType?.department,
    fetchSignerUsers,
    selectedSignerUserId,
    selectedApproverUserId
  ]);
  const sendEditorCommand = useCallback((command: string) => {
    setEditorCommand(`${command}|${Date.now()}`);
  }, []);
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
  useFocusEffect(useCallback(() => {
    getListDocument({ type: 'OUTGOING' });
  }, [getListDocument]));
  useEffect(() => {
    if (isCreating) {
      getCategoryList(undefined, { isFromNumbering: true });
    }
  }, [getCategoryList, isCreating]);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      if (editorFocusedRef.current) {
        scrollCreateFormToEditor(Platform.OS === 'ios' ? 160 : 260);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollCreateFormToEditor]);
  useEffect(() => {
    if (!selectedCategoryId || selectedCategoryName || categories.length === 0) { return; }
    const matched = categories.find(category => category._id === selectedCategoryId);
    if (matched?.name) {
      setSelectedCategoryName(matched.name);
    }
  }, [categories, selectedCategoryId, selectedCategoryName]);

  useEffect(() => {
    const mappedDocuments: TOutgoingItem[] = (listDocument || []).map((item: IDocument) => ({
      // Use the API-returned currentStep directly to reflect actual business step order
      step: `Bước ${item.currentStep ?? 0}`,
      id: item._id,
      title: item.title || '',
      code: item.registeredNumber || 'Chưa có số hiệu',
      time: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '',
      status: getOutgoingStatusDisplay(item.status, levelKey),
      rawStatus: item.status,
    }));

    setDocuments(mappedDocuments);
  }, [levelKey, listDocument]);
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
  const commitEditorContent = useCallback((html: string, syncState = false) => {
    const nextHtml = html || '';
    editorContentRef.current = nextHtml;
    if (syncState) {
      setEditorContent(nextHtml);
    }
  }, []);
  const setEditorContentForLoad = useCallback((html: string) => {
    commitEditorContent(html, true);
    setEditorContentVersion(prev => prev + 1);
  }, [commitEditorContent]);
  const handleEditorContentChange = useCallback((html: string) => {
    commitEditorContent(html);
  }, [commitEditorContent]);
  const requestEditorContent = useCallback(() => {
    if (!editorRef.current || !editorReadyRef.current) {
      return Promise.resolve(editorContentRef.current || editorContent);
    }

    return new Promise<string>(resolve => {
      const timeout = setTimeout(() => {
        editorContentRequestRef.current = null;
        resolve(editorContentRef.current || editorContent);
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
  }, [commitEditorContent, editorContent]);

  const openCreateForm = useCallback(() => {
    setEditingDocument(null);
    setTitleValue('');
    setCodeValue('');
    setEditorContentForLoad('');
    editorReadyRef.current = false;
    editorContentRequestRef.current = null;
    setSignedFilesNew([]);
    setAttachedFilesNew([]);
    setSelectedCategoryId('');
    setSelectedCategoryName('');
    setPriorityValue('');
    setSignedDepartmentValue('');
    setErrors({});
    setExistingSignedFiles([]);
    setExistingAttachedFiles([]);
    setFilesToRemove([]);
    setSignerUserList([]);
    setApproverUserList([]);
    setSelectedSignerUserId('');
    setSelectedSignerUserName('');
    setSelectedApproverUserId('');
    setSelectedApproverUserName('');
    setSelectedReceiveDeptId('');
    setSelectedReceiveDeptName('');
    fetchDepartments();
    setIsCreating(true);
  }, [setEditorContentForLoad, fetchDepartments]);

  const openEditForm = async (item: TOutgoingItem) => {
    if (isLoading || isPreparingForm) { return; }
    setIsPreparingForm(true);
    setEditingDocument(item);
    setTitleValue(item.title);
    setCodeValue(item.code);
    setEditorContentForLoad('');
    editorReadyRef.current = false;
    editorContentRequestRef.current = null;
    try {
      const currentDepts = await fetchDepartments();
      const detail = await getDocumentDetail(item.id);
      const fallbackDoc = (listDocument || []).find((doc: IDocument) => doc._id === item.id) || null;
      const sourceDocRaw: IDocument | { document?: IDocument | null } | null =
        (detail as IDocument | { document?: IDocument | null } | null) ||
        fallbackDoc ||
        null;
      const sourceDoc =
        sourceDocRaw &&
        typeof sourceDocRaw === 'object' &&
        'document' in sourceDocRaw &&
        sourceDocRaw.document &&
        typeof sourceDocRaw.document === 'object'
          ? sourceDocRaw.document
          : (sourceDocRaw as IDocument | null);
      if (sourceDoc) {
        const detailContent = (sourceDoc.content || '').trimStart();
        const detailCategoryId = (sourceDoc.categoryId as any)?._id || (sourceDoc.categoryId as any)?.toString?.() || '';
        const detailCategoryName = (sourceDoc.categoryId as any)?.name || sourceDoc.categoryDocumentName || '';
        setTitleValue((sourceDoc.title || item.title || '').trimStart());
        setCodeValue((sourceDoc.registeredNumber || item.code || '').trimStart());
        setEditorContentForLoad(detailContent);
        setSelectedCategoryId(detailCategoryId);
        setSelectedCategoryName(detailCategoryName);
        setPriorityValue((sourceDoc.priority as EDocumentPriority) || '');

        // Parse receive department
        const rawReceiveDept = (sourceDoc as any).receiveDepartmentId;
        let receiveDeptId = '';
        let receiveDeptName = '';
        if (rawReceiveDept) {
          if (typeof rawReceiveDept === 'object') {
            receiveDeptId = rawReceiveDept._id || rawReceiveDept.id || '';
            receiveDeptName = rawReceiveDept.name || '';
          } else {
            receiveDeptId = rawReceiveDept.toString();
          }
        }
        if (receiveDeptId) {
          const matchedDept = currentDepts.find(d => d._id === receiveDeptId);
          if (matchedDept) {
            receiveDeptName = matchedDept.name;
          }
        }
        setSelectedReceiveDeptId(receiveDeptId);
        setSelectedReceiveDeptName(receiveDeptName);

        // Load existing signer and approver IDs
        const rawSignerUserId = (sourceDoc as any).signerUserId || '';
        setSelectedSignerUserId(rawSignerUserId);

        const rawApproverUserId = (sourceDoc as any).approverUserId || '';
        setSelectedApproverUserId(rawApproverUserId);

        // Set signedDepartmentValue to trigger the useEffect that resolves names and fetches signer list
        setSignedDepartmentValue((sourceDoc.signedDepartment as ESignDepartment) || '');
        const signed = [
          ...(Array.isArray(sourceDoc.signedFiles) ? sourceDoc.signedFiles : []),
          ...(Array.isArray(sourceDoc.mainFiles) ? sourceDoc.mainFiles : []),
          ...(Array.isArray(sourceDoc.approvedFiles) ? sourceDoc.approvedFiles : []),
        ];
        const attached = [
          ...(Array.isArray(sourceDoc.attachedFiles) ? sourceDoc.attachedFiles : []),
        ];
        const rawFiles = asArray((sourceDoc as any)?.files);
        const documentFiles = [
          ...asArray((sourceDoc as any)?.documentFile),
          ...asArray((sourceDoc as any)?.documentFiles),
        ];
        const signedFromRaw = [
          ...pickByType(rawFiles, ['SIGNED', 'SIGN', 'MAIN']),
          ...documentFiles,
        ];
        const attachedFromRaw = pickByType(rawFiles, ['ATTACHED', 'ATTACHMENT']);
        const signedCandidates = signed.length > 0 ? [...signed, ...signedFromRaw] : [...signedFromRaw, ...rawFiles];
        const attachedCandidates = attached.length > 0 ? [...attached, ...attachedFromRaw] : attachedFromRaw;
        setExistingSignedFiles(
          dedupeExistingFiles(
            signedCandidates.map((f: any, index: number) =>
              normalizeExistingFile(f, 'signed', index + 1),
            ),
          ),
        );
        setExistingAttachedFiles(
          dedupeExistingFiles(
            attachedCandidates.map((f: any, index: number) =>
              normalizeExistingFile(f, 'attached', index + 1),
            ),
          ),
        );
      }
      setFilesToRemove([]);
      setSignedFilesNew([]);
      setAttachedFilesNew([]);
      setIsCreating(true);
    } finally {
      setIsPreparingForm(false);
    }
  };

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
      setErrors(prev => ({ ...prev, signedFiles: undefined }));
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
    formData.append('priority', priorityValue);
    formData.append('registeredNumber', codeValue);
    formData.append('categoryId', selectedCategoryId);
    formData.append('departmentId', userInfo?.userType?.department || '');
    formData.append('version', '1.0');
    formData.append('receiveDepartmentId', selectedReceiveDeptId || userInfo?.userType?.department || '');
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

      // Send kept files explicitly so backend does not clear file lists on draft/rejected updates.
      formData.append('existingSignedFiles', JSON.stringify(keptSignedFiles));
      formData.append('existingAttachedFiles', JSON.stringify(keptAttachedFiles));
      formData.append('filesToRemove', JSON.stringify(filesToRemove));
    }
    const ok = editingDocument?.id
      ? await updateOutgoingDocument(editingDocument.id, formData)
      : await createOutgoingDocument(formData);
    if (ok) {
      setIsCreating(false);
      getListDocument({ type: 'OUTGOING' });
    }
  };
  const handleRemoveExistingSignedFile = (file: TExistingFile) => {
    setExistingSignedFiles(prev => prev.filter(item => item.fileKey !== file.fileKey));
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
  const askDeleteDocument = (item: TOutgoingItem) => {
    setDeletingDocument(item);
  };
  const cancelDeleteDocument = () => {
    setDeletingDocument(null);
  };
  const confirmDeleteDocument = async () => {
    if (!deletingDocument) {return;}
    if (isLoading) { return; }
    const ok = await deleteDocument(deletingDocument.id);
    if (ok) {
      await getListDocument({ type: 'OUTGOING' });
    }
    setDeletingDocument(null);
  };



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
    filesToRemove,
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
    setEditorContent,
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
