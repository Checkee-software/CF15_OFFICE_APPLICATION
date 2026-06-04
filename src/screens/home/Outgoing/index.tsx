import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import DeleteModal from '@/utils/Modals/DeleteModal';
import { useDocumentStore } from '@/stores/documentStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import { getStatusLabel } from '@/shared-types/common/Document/document';
import { DOCUMENT_PRIORITY_LABEL, EDocumentPriority, EDocumentStatus, ESignDepartment, SIGN_DEPARTMENT_LABEL } from '@/shared-types/common/Document/document';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import Loading from '@/screens/subscreen/Loading';
import Backdrop from '@/screens/subscreen/Loading/index2';
type TExistingFile = { fileKey: string; filename: string; originalname: string };
type TPickedFile = { uri: string; name: string; type: string; size?: number };
type TLevelKey = 'CBNV' | 'PHONG_BAN' | 'VAN_THU' | 'BAN_GIAM_DOC';

type TOutgoingItem = {
  id: string;
  title: string;
  code: string;
  time: string;
  step: string;
  status: string; 
  rawStatus?: string;
};

const getSafeBaseName = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) { return ''; }
  const noQuery = raw.split('?')[0].split('#')[0];
  const slashParts = noQuery.split('/');
  const lastSlashPart = slashParts[slashParts.length - 1] || '';
  const backslashParts = lastSlashPart.split('\\');
  return backslashParts[backslashParts.length - 1] || lastSlashPart;
};

const normalizeDisplayName = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) { return ''; }
  if (raw.includes('/') || raw.includes('\\')) {
    return getSafeBaseName(raw);
  }
  return raw;
};

const normalizeExistingFile = (
  file: any,
  fallbackPrefix: string,
  index: number,
): TExistingFile => {
  const rawString = typeof file === 'string' ? file : '';
  const backendFilenameCandidates = [
    file?.filename,
    file?.fileName,
    file?.file?.filename,
    file?.file?.fileName,
    rawString,
    getSafeBaseName(
      file?.filename ||
        file?.fileName ||
        file?.file?.filename ||
        file?.file?.fileName ||
        file?.path ||
        file?.url ||
        file?.uri ||
        file?.location ||
        rawString,
    ),
  ]
    .map((item: any) => String(item || '').trim())
    .filter((item: string) => Boolean(item) && !item.includes('/') && !item.includes('\\'));
  const uiKeyCandidates = [
    ...backendFilenameCandidates,
    file?._id,
    file?.id,
    file?.key,
    file?.fileKey,
    file?.path,
    file?.url,
    file?.uri,
    file?.location,
  ]
    .map((item: any) => String(item || '').trim())
    .filter(Boolean);
  const displayCandidates = [
    file?.originalname,
    file?.originalName,
    file?.file?.originalname,
    file?.file?.originalName,
    file?.name,
    file?.displayName,
    file?.title,
    file?.filename,
    file?.fileName,
    rawString,
  ]
    .map((item: any) => normalizeDisplayName(item))
    .filter(Boolean);
  const backendFilename = backendFilenameCandidates[0] || '';
  const uiKey = uiKeyCandidates[0] || `${fallbackPrefix}-${index}`;
  const fallbackName = `${fallbackPrefix}-file-${index}.pdf`;
  return {
    fileKey: uiKey,
    filename: backendFilename,
    originalname: displayCandidates[0] || getSafeBaseName(backendFilename) || fallbackName,
  };
};

const asArray = (value: any): any[] => {
  if (Array.isArray(value)) { return value; }
  if (value === null || value === undefined) { return []; }
  if (typeof value === 'string') { return [{ path: value }]; }
  if (typeof value === 'object') { return [value]; }
  return [];
};

const pickByType = (files: any[], typeCodes: string[]) =>
  files.filter((f: any) => typeCodes.includes(String(f?.type || f?.fileType || f?.file?.type || f?.file?.fileType || '').toUpperCase()));

const dedupeExistingFiles = (files: TExistingFile[]) => {
  const seen = new Set<string>();
  return files.filter(file => {
    const key = `${file.filename || ''}|${file.originalname || ''}|${file.fileKey || ''}`;
    if (seen.has(key)) { return false; }
    seen.add(key);
    return true;
  });
};

const isObjectIdLike = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

const resolveCreatorDepartmentCode = (userInfo: any) => {
  const directCandidates = [
    userInfo?.departmentCode,
    userInfo?.department?.code,
    userInfo?.userType?.departmentCode,
    userInfo?.userType?.department?.code,
  ]
    .map((item: any) => String(item || '').trim())
    .filter(Boolean);
  if (directCandidates.length > 0) {
    return directCandidates[0];
  }

  const userDepartment = String(userInfo?.userType?.department || '').trim();
  if (!userDepartment || isObjectIdLike(userDepartment)) {
    return '';
  }
  return userDepartment;
};

const applyDepartmentCodeToRegisteredFormat = (format: string, departmentCode: string) => {
  const normalizedFormat = String(format || '').trim();
  const normalizedDepartmentCode = String(departmentCode || '').trim();
  if (!normalizedFormat || !normalizedDepartmentCode) {
    return normalizedFormat;
  }

  const parts = normalizedFormat.split('/');
  const placeholderIndex = parts.findIndex(part => {
    const normalizedPart = String(part || '').trim().toLowerCase();
    return normalizedPart.includes('co quan ban h') || normalizedPart.includes('quan ban h');
  });

  if (placeholderIndex >= 0) {
    parts[placeholderIndex] = normalizedDepartmentCode;
    return parts.join('/');
  }

  return normalizedFormat;
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  'Bản nháp': { bg: '#ECECEC', color: '#666666' },
  'Gửi duyệt': { bg: '#FFF0DD', color: '#F39C12' },
  'TP duyệt': { bg: '#E5F8E8', color: '#4CAF50' },
  'VT kiểm tra': { bg: '#FFF5DF', color: '#FFB300' },
  'Phê duyệt': { bg: '#E8F7EA', color: '#66BB6A' },
  'Phát hành': { bg: '#E3F0FF', color: '#42A5F5' },
  'Lưu trữ': { bg: '#E9F8EC', color: '#81C784' },
  'Từ chối': { bg: '#FFEAEA', color: '#FF6B6B' },
};

const OUTGOING_FILTER_ALL = 'Tất cả';
const OUTGOING_ALL_FILTERS = [OUTGOING_FILTER_ALL, 'Bản nháp', 'Gửi duyệt', 'TP duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'];

const OUTGOING_ALL_STATUSES_BY_LEVEL: Record<TLevelKey, string[]> = {
  CBNV: ['Bản nháp', 'Gửi duyệt', 'TP duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
  PHONG_BAN: ['Bản nháp', 'Gửi duyệt', 'TP duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
  VAN_THU: ['Gửi duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
  BAN_GIAM_DOC: ['Gửi duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
};

const OUTGOING_STATUS_DISPLAY: Record<string, string> = {
  DRAFT: 'Bản nháp',
  SENDING: 'Gửi duyệt',
  MANAGER_INITIAL_SIGNING: 'TP duyệt',
  MANAGER_SIGNING: 'TP duyệt',
  MANAGER_APPROVING: 'TP duyệt',
  CLERK_CHECKING: 'VT kiểm tra',
  DIRECTOR_INITIAL_SIGNING: 'Phê duyệt',
  DIRECTOR_SIGNING: 'Phê duyệt',
  DIRECTOR_APPROVING: 'Phê duyệt',
  READY_TO_PUBLISH: 'Phát hành',
  OFFICIAL_PUBLISHED: 'Phát hành',
  ARCHIVED: 'Lưu trữ',
  REJECTED: 'Từ chối',
};

const getOutgoingStatusDisplay = (status: unknown, level: TLevelKey) => {
  const normalizedStatus = String(status || '').toUpperCase();

  if (level === 'VAN_THU') {
    if (
      [
        'MANAGER_INITIAL_SIGNING',
        'MANAGER_SIGNING',
        'MANAGER_APPROVING',
        'DIRECTOR_INITIAL_SIGNING',
        'DIRECTOR_SIGNING',
        'DIRECTOR_APPROVING',
      ].includes(normalizedStatus)
    ) {
      return 'Phê duyệt';
    }
  }

  if (level === 'BAN_GIAM_DOC') {
    if (
      [
        'MANAGER_INITIAL_SIGNING',
        'MANAGER_SIGNING',
        'MANAGER_APPROVING',
      ].includes(normalizedStatus)
    ) {
      return 'Gửi duyệt';
    }
  }

  return OUTGOING_STATUS_DISPLAY[normalizedStatus] || getStatusLabel(status as any);
};

const getLevelKey = (level?: EOrganization): TLevelKey => {
  if (level === EOrganization.DEPARTMENT) { return 'PHONG_BAN'; }
  // Business rule: LEADER uses CBNV outgoing flow.
  if (level === EOrganization.LEADER) { return 'CBNV'; }
  if (level === EOrganization.STATIONARY) { return 'VAN_THU'; }
  if (level === EOrganization.MANAGEMENT) { return 'BAN_GIAM_DOC'; }
  return 'CBNV';
};

export default function Outgoing({ navigation }: any) {
  const { userInfo } = useAuthStore();
  const editorRef = useRef<any>(null);
  const createScrollRef = useRef<any>(null);
  const editorFocusedRef = useRef(false);
  const [searchText, setSearchText] = useState('');
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
  const [initialEditorHtml, setInitialEditorHtml] = useState<string | null>(null);
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
  const visibleFilters = OUTGOING_ALL_FILTERS;
  const scrollCreateFormToEditor = useCallback((delay = 0) => {
    const scrollToEditor = () => {
      createScrollRef.current?.scrollToEnd?.(true);
      editorRef.current?.injectJavaScript('window.__ensureCaretVisible && window.__ensureCaretVisible();true;');
    };

    if (delay > 0) {
      setTimeout(scrollToEditor, delay);
      return;
    }

    requestAnimationFrame(scrollToEditor);
  }, []);
  const [activeFilter, setActiveFilter] = useState(OUTGOING_FILTER_ALL);
  const isDraftStatus = (status: string, rawStatus?: string) => {
    const normalizedRawStatus = String(rawStatus || '').toUpperCase();
    return normalizedRawStatus === EDocumentStatus.DRAFT || status === 'Bản nháp';
  };
  const isRejectedStatus = (status: string, rawStatus?: string) => {
    const normalizedRawStatus = String(rawStatus || '').toUpperCase();
    return normalizedRawStatus === EDocumentStatus.REJECTED || status === 'Từ chối';
  };
  const isUpdatableStatus = (status: string, rawStatus?: string) => {
    return isDraftStatus(status, rawStatus);
  };
  const isDeletableStatus = (status: string, rawStatus?: string) => {
    return isDraftStatus(status, rawStatus) || isRejectedStatus(status, rawStatus);
  };

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

  useEffect(() => {
    if (!editorCommand || !editorRef.current) { return; }
    editorRef.current.injectJavaScript(`window.__apply(${JSON.stringify(editorCommand)});true;`);
  }, [editorCommand]);

  const editorHTML = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: Arial, sans-serif;
      height: 100%;
    }

    body {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    #editor {
      min-height: 100%;
      padding: 12px 12px 96px;
      font-size: 14px;
      color: #222;
      outline: none;
      line-height: 1.6;
      background: #fff;
      box-sizing: border-box;
      caret-color: #1E88E5;
      overflow-wrap: anywhere;
      scroll-padding-bottom: 96px;
    }

    #editor:empty:before {
      content: "Nhập nội dung văn bản...";
      color: #A0A0A0;
    }

    p {
      margin: 0 0 8px;
    }

    h1 {
      font-size: 22px;
      margin: 0 0 10px;
    }

    h2 {
      font-size: 18px;
      margin: 0 0 10px;
    }
  </style>
</head>

<body>
  <div id="editor" contenteditable="true"></div>

  <script>
    document.execCommand('styleWithCSS', false, true);
    var editor = document.getElementById('editor');

    function postToNative(payload){
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }

    function scrollByOffset(offset){
      if(!offset) return;
      try {
        window.scrollBy({ top: offset, behavior: 'smooth' });
      } catch(e) {
        window.scrollBy(0, offset);
      }
    }

    function ensureCaretVisible(){
      requestAnimationFrame(function(){
        var selection = window.getSelection && window.getSelection();
        if(!selection || selection.rangeCount === 0) return;

        var range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);

        var rect = range.getBoundingClientRect();
        var rects = range.getClientRects();
        if((!rect || rect.height === 0) && rects.length > 0){
          rect = rects[rects.length - 1];
        }

        if(!rect) return;

        var viewportHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight || document.documentElement.clientHeight;
        var bottomLimit = viewportHeight - 72;
        var topLimit = 16;

        if(rect.bottom > bottomLimit){
          scrollByOffset(rect.bottom - bottomLimit + 24);
          return;
        }

        if(rect.top < topLimit){
          scrollByOffset(rect.top - topLimit - 16);
        }
      });
    }

    window.__ensureCaretVisible = ensureCaretVisible;

    window.__apply = function(raw){
      if(!raw) return;

      var command = raw.split('|')[0];
      editor.focus();

      if(command === 'bold'){
        document.execCommand('bold');
        ensureCaretVisible();
        return;
      }

      if(command === 'italic'){
        document.execCommand('italic');
        ensureCaretVisible();
        return;
      }

      if(command === 'undo'){
        document.execCommand('undo');
        ensureCaretVisible();
        return;
      }

      if(command === 'redo'){
        document.execCommand('redo');
        ensureCaretVisible();
        return;
      }

      if(command.indexOf('foreColor:') === 0){
        document.execCommand('foreColor', false, command.split(':')[1]);
        ensureCaretVisible();
        return;
      }

      if(command.indexOf('formatBlock:') === 0){
        document.execCommand('formatBlock', false, command.split(':')[1]);
        ensureCaretVisible();
        return;
      }

      postToNative({
        type: 'content',
        html: editor.innerHTML
      });
    };

    window.__setContent = function(html){
      editor.innerHTML = html || '';
      postToNative({
        type: 'content',
        html: editor.innerHTML
      });
      ensureCaretVisible();
    };

    editor.addEventListener('input', function(){
      postToNative({
        type: 'content',
        html: editor.innerHTML
      });
      ensureCaretVisible();
    });

    editor.addEventListener('focus', function(){
      postToNative({ type: 'focus' });
      setTimeout(ensureCaretVisible, 80);
    });

    editor.addEventListener('blur', function(){
      postToNative({ type: 'blur' });
    });

    editor.addEventListener('keyup', ensureCaretVisible);
    editor.addEventListener('mouseup', ensureCaretVisible);
    document.addEventListener('selectionchange', function(){
      if(document.activeElement === editor){
        ensureCaretVisible();
      }
    });

    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', function(){
        if(document.activeElement === editor){
          setTimeout(ensureCaretVisible, 80);
        }
      });
    }
  </script>
</body>
</html>
`;

  const filteredDocuments = useMemo(() => {
    const allowedStatusesByLevel = OUTGOING_ALL_STATUSES_BY_LEVEL[levelKey] || OUTGOING_ALL_STATUSES_BY_LEVEL.CBNV;
    return documents.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
      if (activeFilter === OUTGOING_FILTER_ALL) {
        return matchSearch && allowedStatusesByLevel.includes(item.status);
      }
      return matchSearch && item.status === activeFilter;
    });
  }, [activeFilter, documents, levelKey, searchText]);

  const openCreateForm = useCallback(() => {
    setEditingDocument(null);
    setTitleValue('');
    setCodeValue('');
    setEditorContent('');
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
    setInitialEditorHtml('');
    setIsCreating(true);
  }, []);

  const renderHeaderCreateButton = useCallback(() => {
    if (!canMutateOutgoing || isCreating) {
      return null;
    }

    return (
      <TouchableOpacity
        accessibilityLabel="Tạo văn bản đi"
        accessibilityRole="button"
        disabled={isLoading || isPreparingForm}
        onPress={openCreateForm}
        style={[
          styles.headerCreateButton,
          (isLoading || isPreparingForm) && styles.headerCreateButtonDisabled,
        ]}>
        <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }, [canMutateOutgoing, isCreating, isLoading, isPreparingForm, openCreateForm]);

  useEffect(() => {
    navigation?.setOptions?.({
      headerShown: true,
      title: 'VẢN BẢN ĐI',
      headerRight: renderHeaderCreateButton,
    });
  }, [navigation, renderHeaderCreateButton]);

  const openEditForm = async (item: TOutgoingItem) => {
    if (isLoading || isPreparingForm) { return; }
    setIsPreparingForm(true);
    setEditingDocument(item);
    setTitleValue(item.title);
    setCodeValue(item.code);
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
        setEditorContent(detailContent);
        setInitialEditorHtml(detailContent);
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
        )
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
    formData.append('content', editorContent || titleValue);
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
  const formatFileSize = (size?: number) => {
    if (!size || size <= 0) { return '-'; }
    if (size >= 1024 * 1024) { return `${(size / (1024 * 1024)).toFixed(1)} mb`; }
    return `${(size / 1024).toFixed(1)} kb`;
  };
  const renderPickedFileRow = (name: string, size?: number, onRemove?: () => void) => (
    <View style={styles.fileRow}>
      <View style={styles.fileLeft}>
        <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FF5252" />
        <Text style={styles.fileName} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.fileRight}>
        <Text style={styles.fileSize}>{formatFileSize(size)}</Text>
        {onRemove ? (
          <TouchableOpacity onPress={onRemove}>
            <MaterialCommunityIcons name="close" size={18} color="#9A9A9A" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

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

  if (isLoading && !isCreating && documents.length === 0) {
    return <Loading />;
  }

  if (isCreating) {
    return (
      <View style={styles.container}>
        <View style={styles.createHeader}>
          <Text style={styles.createTitle}>{editingDocument ? 'Cập nhật văn bản đi' : 'Tạo văn bản đi'}</Text>
          <TouchableOpacity onPress={() => setIsCreating(false)}>
            <Text style={styles.createReset}>Đóng lại</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          ref={createScrollRef}
          style={styles.createScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.createScroll, isKeyboardVisible && styles.createScrollKeyboard]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          enableOnAndroid
          enableAutomaticScroll
          enableResetScrollToCoords={false}
          extraScrollHeight={Platform.OS === 'ios' ? 24 : 96}
        >
          <Text style={styles.fieldLabel}>Tiêu đề tài liệu <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, errors.title && styles.inputWrapError]}>
            <TextInput style={styles.input} placeholder="Nhập nội dung" placeholderTextColor="#A0A0A0" value={titleValue} onChangeText={setTitleValue} />
          </View>
          {!!errors.title && <Text style={styles.fieldError}>Bắt buộc!</Text>}

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Loại tài liệu <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={[styles.select, errors.categoryId && styles.inputWrapError]} onPress={() => setShowCategoryMenu(prev => !prev)}>
                <Text style={styles.selectText}>{selectedCategoryName || 'Chọn loại'}</Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
              {showCategoryMenu && (
                <View style={styles.dropdownMenu}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category._id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCategoryId(category._id);
                        setSelectedCategoryName(category.name || '');
                        if (category.format) {
                          setCodeValue(applyDepartmentCodeToRegisteredFormat(category.format, creatorDepartmentCode));
                        }
                        setErrors(prev => ({ ...prev, categoryId: undefined, registeredNumber: undefined }));
                        setShowCategoryMenu(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{category.name} ({category.code})</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!!errors.categoryId && <Text style={styles.fieldError}>Vui lòng chọn!</Text>}
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Mức độ ưu tiên <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.select} onPress={() => setShowPriorityMenu(prev => !prev)}>
                <Text style={styles.selectText}>
                  {priorityValue ? DOCUMENT_PRIORITY_LABEL[priorityValue] : 'Chọn mức độ'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
              {showPriorityMenu && (
                <View style={styles.dropdownMenu}>
                  {Object.values(EDocumentPriority).map(priority => (
                    <TouchableOpacity
                      key={priority}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPriorityValue(priority);
                        setShowPriorityMenu(false);
                        setErrors(prev => ({ ...prev, priority: undefined }));
                      }}>
                      <Text style={styles.dropdownItemText}>{DOCUMENT_PRIORITY_LABEL[priority]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!!errors.priority && <Text style={styles.fieldError}>{errors.priority}</Text>}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Số hiệu văn bản <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, errors.registeredNumber && styles.inputWrapError]}>
            <TextInput style={styles.input} placeholder="Nhập số hiệu" placeholderTextColor="#A0A0A0" value={codeValue} onChangeText={setCodeValue} />
          </View>
          {!!errors.registeredNumber && <Text style={styles.fieldError}>Bắt buộc!</Text>}

          <View style={styles.fullDropdownWrap}>
            <Text style={styles.fieldLabel}>Bộ phận ký duyệt <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.select} onPress={() => setShowSignDepartmentMenu(prev => !prev)}>
              <Text style={styles.selectText}>
                {signedDepartmentValue ? SIGN_DEPARTMENT_LABEL[signedDepartmentValue] : 'Chọn bộ phận ký duyệt'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            {showSignDepartmentMenu && (
              <View style={styles.dropdownMenu}>
                {Object.values(ESignDepartment).map(dept => (
                  <TouchableOpacity
                    key={dept}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSignedDepartmentValue(dept);
                      setShowSignDepartmentMenu(false);
                      setErrors(prev => ({ ...prev, signedDepartment: undefined }));
                    }}>
                    <Text style={styles.dropdownItemText}>{SIGN_DEPARTMENT_LABEL[dept]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!errors.signedDepartment && <Text style={styles.fieldError}>{errors.signedDepartment}</Text>}
          </View>

          <View style={styles.receiverRow}>
            <Text style={styles.receiverLabel}>Bộ phận tiếp nhận:</Text>
            <Text style={styles.receiverValue}>Phòng kế toán</Text>
          </View>

          <TouchableOpacity style={[styles.uploadSign, errors.signedFiles && styles.inputWrapError]} onPress={handlePickSignedFiles}>
            <View style={styles.uploadLeft}>
              <MaterialCommunityIcons name="file-plus-outline" size={17} color="#333" />
              <Text style={styles.uploadSignText}>Thêm văn bản trình ký (.pdf)</Text>
            </View>
            <MaterialCommunityIcons name="plus" size={20} color="#4CAF50" />
          </TouchableOpacity>
          {!!errors.signedFiles && <Text style={styles.fieldErrorLeft}>{errors.signedFiles}</Text>}
          {existingSignedFiles.map(file => (
            <View key={file.fileKey}>
              {renderPickedFileRow(file.originalname, undefined, () => handleRemoveExistingSignedFile(file))}
            </View>
          ))}
          {signedFilesNew.map(file => (
            <View key={`${file.uri}-${file.name}`}>
              {renderPickedFileRow(file.name, file.size, () => setSignedFilesNew(prev => prev.filter(i => i.uri !== file.uri)))}
            </View>
          ))}

          <TouchableOpacity style={styles.uploadAttach} onPress={handlePickAttachedFiles}>
            <View style={styles.uploadLeft}>
              <MaterialCommunityIcons name="file-plus-outline" size={17} color="#333" />
              <Text style={styles.uploadAttachText}>
                {attachedFilesNew.length > 0 ? `Đã chọn ${attachedFilesNew.length} file đính kèm` : 'Thêm văn bản đính kèm (.pdf)'}
              </Text>
            </View>
            <MaterialCommunityIcons name="plus" size={20} color="#FF9800" />
          </TouchableOpacity>
          {existingAttachedFiles.map(file => (
            <View key={file.fileKey}>
              {renderPickedFileRow(file.originalname, undefined, () => handleRemoveExistingAttachedFile(file))}
            </View>
          ))}
          {attachedFilesNew.map(file => (
            <View key={`${file.uri}-${file.name}`}>
              {renderPickedFileRow(file.name, file.size, () => setAttachedFilesNew(prev => prev.filter(i => i.uri !== file.uri)))}
            </View>
          ))}

          <Text style={styles.fieldLabel}>Nội dung văn bản <Text style={styles.required}>*</Text></Text>


        <View style={styles.editorContainer}>
          <View style={styles.editorToolbar}>
            <TouchableOpacity style={styles.toolbarIconBtn} onPress={() => sendEditorCommand('undo')}>
              <MaterialCommunityIcons name="undo-variant" size={18} color="#3D495A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarIconBtn} onPress={() => sendEditorCommand('redo')}>
              <MaterialCommunityIcons name="redo-variant" size={18} color="#3D495A" />
            </TouchableOpacity>

            <View style={styles.toolbarDivider} />

            <TouchableOpacity style={styles.toolbarDropdown} onPress={() => {

              setShowColorMenu(false);
              setShowFormatMenu(!showFormatMenu);
            }}>
              <Text style={styles.toolbarDropdownText}>{activeFormat}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#7C8797" />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity onPress={() => sendEditorCommand('bold')}>
              <Text style={styles.toolbarStrong}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => sendEditorCommand('italic')}>
              <Text style={styles.toolbarItalic}>I</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarAButton} onPress={() => {
              setShowFormatMenu(false);
              setShowColorMenu(!showColorMenu);
            }}>
              <Text style={styles.toolbarUnderline}>A</Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color="#7C8797" />
            </TouchableOpacity>
          </View>

          {showFormatMenu && (
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('Paragraph')}>
                <Text style={styles.menuText}>Paragraph</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('H1')}>
                <Text style={styles.menuText}>Heading 1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('H2')}>
                <Text style={styles.menuText}>Heading 2</Text>
              </TouchableOpacity>
            </View>
          )}

          {showColorMenu && (
            <View style={styles.colorMenu}>
              {['#111827', '#374151', '#6B7280', '#1E88E5', '#1976D2', '#0EA5E9', '#43A047', '#22C55E', '#84CC16', '#F59E0B', '#F4511E', '#DC2626', '#D81B60', '#8E24AA', '#7C3AED', '#0F766E', '#0891B2', '#334155', '#000000', '#94A3B8', '#06B6D4', '#2563EB', '#65A30D', '#EAB308', '#EA580C', '#EF4444', '#EC4899', '#A855F7', '#14B8A6'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: color }]}
                  onPress={() => chooseColor(color)}
                />
              ))}
            </View>
          )}

          <View style={styles.editorBody}>
            <AutoHeightWebView
              ref={editorRef}
              originWhitelist={['*']}
              source={{ html: editorHTML }}
              javaScriptEnabled
              scrollEnabled={isEditorFocused}
              nestedScrollEnabled
              viewportContent={'width=device-width, user-scalable=no'}
              onLoadEnd={() => {
                if (initialEditorHtml === null || !editorRef.current) { return; }
                editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(initialEditorHtml)});true;`);
                setInitialEditorHtml(null);
              }}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'content') {
                    setEditorContent(data.html || '');
                    return;
                  }
                  if (data.type === 'focus') {
                    editorFocusedRef.current = true;
                    setIsEditorFocused(true);
                    scrollCreateFormToEditor(Platform.OS === 'ios' ? 80 : 140);
                    return;
                  }
                  if (data.type === 'blur') {
                    editorFocusedRef.current = false;
                    setIsEditorFocused(false);
                  }
                } catch (e) { }
              }}
              style={styles.webview}
            />
          </View>
        </View>

        {!isKeyboardVisible && (
        <View style={styles.bottomActions}>
          {(isLeaderLevel || isDepartmentLevel || isStationaryLevel) && !editingDocument ? (
            <TouchableOpacity style={[styles.btnDraft, isLoading && { opacity: 0.7 }]} disabled={isLoading} onPress={() => handleCreateOutgoing('DRAFT')}>
              <Text style={styles.btnDraftText}>Lưu bản nháp</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btnDraft, isLoading && { opacity: 0.7 }]} disabled={isLoading} onPress={() => setIsCreating(false)}>
              <Text style={styles.btnDraftText}>Đóng</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.btnSubmit, isLoading && { opacity: 0.7 }]} disabled={isLoading} onPress={() => handleCreateOutgoing('SENDING')}>
            <Text style={styles.btnSubmitText}>{editingDocument ? 'Cập nhật & gửi' : 'Xác nhận gửi'}</Text>
          </TouchableOpacity>
        </View>
        )}
        </KeyboardAwareScrollView>
        <Backdrop open={isLoading || isPreparingForm} />
      </View>
    );
  }

  return (
    <View style={styles.container}>


      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9A9A9A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm văn bản..."
            placeholderTextColor="#9A9A9A"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="tune-variant" size={20} color="#858585" />
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRowContent}>
          {visibleFilters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.chip, activeFilter === filter && styles.chipActive]}
              onPress={() => setActiveFilter(filter)}>
              <Text style={[styles.chipText, activeFilter === filter && styles.chipTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.totalText}>Tổng số văn bản đi: {filteredDocuments.length}</Text>

      <FlatList
        data={filteredDocuments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const status = STATUS_COLOR[item.status] || STATUS_COLOR['Bản nháp'];
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('DETAILDOCUMENTS', {
                  documentId: item.id,
                  sourceModule: 'outgoingDocument',
                })
              }>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLeft}>Số hiệu: {item.code}</Text>
                <Text style={styles.metaRight}>{item.time}</Text>
              </View>
              <View style={styles.bottomRow}>
                <Text style={styles.stepText}>{item.step}</Text>
                <View style={styles.actionRow}>
                  {canMutateOutgoing && (
                    <>
                      {isUpdatableStatus(item.status, item.rawStatus) && (
                        <TouchableOpacity disabled={isLoading || isPreparingForm} onPress={() => openEditForm(item)}>
                          <MaterialCommunityIcons name="pencil-outline" size={16} color="#2196F3" />
                        </TouchableOpacity>
                      )}
                      {isDeletableStatus(item.status, item.rawStatus) && (
                        <TouchableOpacity disabled={isLoading || isPreparingForm} onPress={() => askDeleteDocument(item)}>
                          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#F15B5B" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#9E9E9E" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <DeleteModal
        visible={Boolean(deletingDocument)}
        itemName={deletingDocument?.title || ''}
        itemType="document"
        onCancel={cancelDeleteDocument}
        onConfirm={confirmDeleteDocument}
        isLoading={isLoading}
      />
      <Backdrop open={isLoading || isPreparingForm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF', paddingHorizontal: 12, paddingTop: 8 },
  headerRow: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerIconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1E1E1E' },
  headerCreateButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  headerCreateButtonDisabled: { opacity: 0.6 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBox: { flex: 1, height: 42, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#D7D7D7', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  searchInput: { flex: 1, color: '#222', fontSize: 14, paddingVertical: 0 },
  filterButton: { width: 36, height: 36, borderWidth: 1, borderColor: '#D7D7D7', borderRadius: 8, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  chipRow: { marginTop: 12, marginBottom: 8 },
  chipScroll: { flexGrow: 0 },
  chipRowContent: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  chip: { backgroundColor: '#D8D8D8', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10, marginRight: 6 },
  chipActive: { backgroundColor: '#54B35A' },
  chipText: { fontSize: 12, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#FFF' },
  totalText: { marginTop: 2, marginBottom: 10, fontSize: 16, color: '#666' },
  listContent: { paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#DBDBDB', marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F1F1F', flex: 1, marginRight: 8 },
  statusTag: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EFEFEF', paddingBottom: 8 },
  metaLeft: { fontSize: 14, color: '#4D4D4D' },
  metaRight: { fontSize: 14, color: '#8E8E8E' },
  bottomRow: { paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepText: { fontSize: 14, color: '#666' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  createHeader: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#DBDBDB', marginHorizontal: -12, paddingHorizontal: 12 },
  createTitle: { fontSize: 30, fontWeight: '700', color: '#161616' },
  createReset: { fontSize: 14, color: '#66BB6A' },
  createScrollView: { flex: 1 },
  createScroll: { paddingBottom: 12, paddingTop: 12, flexGrow: 1 },
  createScrollKeyboard: { paddingBottom: 96 },
  fieldLabel: { fontSize: 17, color: '#222', marginBottom: 6, marginTop: 8 },
  required: { color: '#F05A5A' },
  inputWrap: { borderWidth: 1, borderColor: '#BFBFBF', borderRadius: 10, backgroundColor: '#F7F7F7', paddingHorizontal: 12 },
  inputWrapError: { borderColor: '#FF4D4F' },
  input: { height: 44, fontSize: 14, color: '#222', paddingVertical: 0, paddingLeft: 2, textAlignVertical: 'center', includeFontPadding: false },
  row: { flexDirection: 'row', gap: 8, zIndex: 20 },
  half: { flex: 1, position: 'relative', zIndex: 20 },
  fullDropdownWrap: { position: 'relative', zIndex: 19 },
  select: { height: 44, borderWidth: 1, borderColor: '#BFBFBF', borderRadius: 10, backgroundColor: '#F7F7F7', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' },
  selectText: { fontSize: 14, color: '#5A5A5A' },
  dropdownMenu: { position: 'absolute', top: 46, left: 0, right: 0, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DCDCDC', borderRadius: 10, maxHeight: 220, zIndex: 50, elevation: 8 },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dropdownItemText: { fontSize: 14, color: '#333' },
  fieldError: { color: '#FF4D4F', fontSize: 12, marginTop: 4, textAlign: 'right' },
  fieldErrorLeft: { color: '#FF4D4F', fontSize: 12, marginTop: -4, marginBottom: 8, textAlign: 'left' },
  receiverRow: { height: 42, borderRadius: 8, backgroundColor: '#E9E9E9', marginTop: 10, marginBottom: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiverLabel: { fontSize: 13, color: '#8B8B8B' },
  receiverValue: { fontSize: 13, color: '#1E88E5', fontWeight: '500' },
  uploadSign: { minHeight: 44, borderWidth: 1, borderColor: '#9BD69E', borderStyle: 'dashed', borderRadius: 10, backgroundColor: '#EAF7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 },
  uploadAttach: { minHeight: 44, borderWidth: 1, borderColor: '#F3B260', borderStyle: 'dashed', borderRadius: 10, backgroundColor: '#FFF3E6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 },
  uploadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  uploadSignText: { fontSize: 13, color: '#555', flexShrink: 1 },
  uploadAttachText: { fontSize: 13, color: '#555', flexShrink: 1 },
  fileRow: { height: 40, backgroundColor: '#EFEFEF', borderRadius: 8, paddingHorizontal: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  fileName: { marginLeft: 8, color: '#4A4A4A', fontSize: 13, flex: 1 },
  fileRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileSize: { color: '#777', fontSize: 12 },
  editorToolbar: {
    height: 42,
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#D7DAE0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    position: 'relative',
    zIndex: 10,
  },
  toolbarIconBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  toolbarDropdown: { height: 28, minWidth: 100, backgroundColor: '#ECEFF3', borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  toolbarDropdownText: { fontSize: 14, color: '#3D495A', fontWeight: '500' },
  toolbarText: { fontSize: 13, color: '#3D495A' },
  toolbarStrong: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3747',
  },
  toolbarItalic: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2E3747',
  },
  toolbarAButton: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 2 },
  toolbarUnderline: {
    fontSize: 18,
    color: '#2E3747',
    textDecorationLine: 'underline',
  },
  menuBox: { position: 'absolute', top: 48, left: 70, width: 150, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8DCE3', borderRadius: 6, zIndex: 20, elevation: 5 },
  fontMenuBox: { position: 'absolute', top: 48, left: 110, width: 160, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8DCE3', borderRadius: 6, zIndex: 21, elevation: 6 },
  menuItem: { paddingHorizontal: 10, paddingVertical: 8 },
  menuText: { fontSize: 13, color: '#2F3A4A' },
  menuDivider: { height: 1, backgroundColor: '#EBEDF0' },
  colorMenu: { position: 'absolute', top: 48, right: 12, width: 132, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8DCE3', borderRadius: 6, zIndex: 22, elevation: 6, padding: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#CDD2DA' },
  editorBody: { flex: 1, borderTopWidth: 1, borderTopColor: '#D3D5DB', backgroundColor: '#FFF', overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: '#FFF' },
  bottomActions: { height: 78, borderTopWidth: 1, borderTopColor: '#DADADA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 10, backgroundColor: '#EFEFEF' },
  btnDraft: { flex: 1, height: 46, borderRadius: 24, borderWidth: 1, borderColor: '#9B9B9B', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F8F8' },
  btnDraftText: { fontSize: 16, color: '#8D8D8D', fontWeight: '500' },
  btnSubmit: { flex: 1.2, height: 46, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50' },
  btnSubmitText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  editorContainer: {
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D3D5DB',
    backgroundColor: '#FFF',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12,
  },
  toolbarDivider: { width: 1, height: 24, backgroundColor: '#D7DAE0', marginHorizontal: 8 },
});







