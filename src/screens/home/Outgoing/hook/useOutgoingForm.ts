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

export function useOutgoingForm() {
  const { userInfo } = useAuthStore();
  const createScrollRef = useRef<any>(null);
  const editorFocusedRef = useRef(false);
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
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showSignDepartmentMenu, setShowSignDepartmentMenu] = useState(false);
  const [priorityValue, setPriorityValue] = useState<EDocumentPriority | ''>('');
  const [signedDepartmentValue, setSignedDepartmentValue] = useState<ESignDepartment | ''>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState<{ priority?: string; signedDepartment?: string; signedFiles?: string; title?: string; categoryId?: string; registeredNumber?: string }>({});
  const [isPreparingForm, setIsPreparingForm] = useState(false);
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
  const setEditorContentForLoad = useCallback((html: string) => {
    editorContentRef.current = html;
    setEditorContent(html);
    setEditorContentVersion(prev => prev + 1);
  }, []);
  const handleEditorContentChange = useCallback((html: string) => {
    editorContentRef.current = html;
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingDocument(null);
    setTitleValue('');
    setCodeValue('');
    setEditorContentForLoad('');
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
    setIsCreating(true);
  }, [setEditorContentForLoad]);

  const openEditForm = async (item: TOutgoingItem) => {
    if (isLoading || isPreparingForm) { return; }
    setIsPreparingForm(true);
    setEditingDocument(item);
    setTitleValue(item.title);
    setCodeValue(item.code);
    setEditorContentForLoad('');
    try {
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

    const formData = new FormData();
    formData.append('title', titleValue);
    const latestEditorContent = editorContentRef.current || editorContent;
    formData.append('content', latestEditorContent || titleValue);
    formData.append('priority', priorityValue);
    formData.append('registeredNumber', codeValue);
    formData.append('categoryId', selectedCategoryId);
    formData.append('departmentId', userInfo?.userType?.department || '');
    formData.append('version', '1.0');
    formData.append('receiveDepartmentId', userInfo?.userType?.department || '');
    formData.append('status', effectiveStatus);
    formData.append('signedDepartment', signedDepartmentValue);

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
  const handleUpdateOutgoing = () => handleCreateOutgoing('SENDING');
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
    documents,
    editingDocument,
    editorCommand,
    editorContent,
    editorContentVersion,
    editorFocusedRef,
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
    handleUpdateOutgoing,
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
    selectedCategoryId,
    selectedCategoryName,
    sendEditorCommand,
    setAttachedFilesNew,
    setCodeValue,
    setEditorContent,
    setErrors,
    setIsCreating,
    setIsEditorFocused,
    setPriorityValue,
    setSelectedCategoryId,
    setSelectedCategoryName,
    setShowCategoryMenu,
    setShowColorMenu,
    setShowFormatMenu,
    setShowPriorityMenu,
    setShowSignDepartmentMenu,
    setSignedDepartmentValue,
    setSignedFilesNew,
    setTitleValue,
    showCategoryMenu,
    showColorMenu,
    showFormatMenu,
    showPriorityMenu,
    showSignDepartmentMenu,
    signedDepartmentValue,
    signedFilesNew,
    titleValue,
    toggleFormat,
    userInfo,
  };
}

export default useOutgoingForm;
