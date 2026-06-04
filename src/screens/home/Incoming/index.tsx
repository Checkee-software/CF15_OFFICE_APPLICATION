import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useAuthStore } from '@/stores/authStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import { DOCUMENT_PRIORITY_LABEL, EDocumentPriority, EDocumentStatus } from '@/shared-types/common/Document/document';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import axiosClient from '@/utils/axiosClient';
import ENV from '@/config/ENV';
import Loading from '@/screens/subscreen/Loading';
import Backdrop from '@/screens/subscreen/Loading/index2';

type TLevelKey = 'LEADER' | 'DEPARTMENT' | 'STATIONARY' | 'MANAGEMENT';
type TTab = { key: string; label: string; statuses: EDocumentStatus[] };
type TPickedFile = { uri: string; name: string; type: string; size?: number };
type TExistingFileSource = 'mainFiles' | 'signedFiles' | 'attachedFiles';
type TExistingFile = {
  fileKey: string;
  filename: string;
  originalname: string;
  source: TExistingFileSource;
};
type TIncomingItem = {
  id: string;
  title: string;
  code: string;
  statusLabel: string;
  rawStatus?: EDocumentStatus;
  createdAt?: string;
  finishedAt?: string;
};
type TFormMode = 'CREATE' | 'LAYOUT_1' | 'LAYOUT_2' | 'LAYOUT_3' | 'LAYOUT_4';
type TIncomingCardAction = {
  isEditable: boolean;
  forcedMode?: Exclude<TFormMode, 'CREATE'>;
  nextActionLabel?: string;
};
type TDirectoryUser = {
  _id: string;
  fullName: string;
  departmentId: string;
  departmentName: string;
};
type TDepartmentOption = {
  id: string;
  name: string;
  code?: string;
};
type TDropdownListOption = {
  key: string;
  label: string;
  subLabel?: string;
  checked?: boolean;
  onPress: () => void;
};
type TIncomingAssignmentDraft = {
  leadDepartmentId: string;
  leadAgencyValue: string;
  leadAgencyPayloadValue: string;
  finishedAtValue: string;
  finishedAtDisplay: string;
  receiveToKnowIds: string[];
  supportDepartmentIds: string[];
  receiveToKnowTextFallback: string;
  supportDepartmentTextFallback: string;
};
type TFocusableIncomingField = 'title' | 'organization' | 'sender' | 'registeredNumber' | 'createdAt' | 'finishedAt';

type TDropdownModalProps = {
  visible: boolean;
  title?: string;
  options: TDropdownListOption[];
  loading?: boolean;
  emptyText?: string;
  onClose: () => void;
};

const DropdownModal = React.memo(({
  visible,
  title,
  options,
  loading = false,
  emptyText = 'Không có dữ liệu để chọn',
  onClose,
}: TDropdownModalProps) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      hardwareAccelerated
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.dropdownModalOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dropdownModalBackdrop}
          onPress={onClose}
        />
        <View style={styles.dropdownModalCard}>
          {!!title && <Text style={styles.dropdownModalTitle}>{title}</Text>}
          {loading ? (
            <View style={styles.dropdownStateRow}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.dropdownStateText}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <FlatList
              data={options}
              style={styles.dropdownList}
              keyExtractor={item => item.key}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              updateCellsBatchingPeriod={24}
              windowSize={4}
              removeClippedSubviews={Platform.OS === 'android'}
              ListEmptyComponent={(
                <View style={styles.dropdownStateRow}>
                  <Text style={styles.dropdownStateText}>{emptyText}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={item.onPress}>
                  <View style={styles.multiItemRow}>
                    {typeof item.checked === 'boolean' ? (
                      <MaterialCommunityIcons
                        name={item.checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={18}
                        color={item.checked ? '#4CAF50' : '#9A9A9A'}
                      />
                    ) : null}
                    <View style={styles.dropdownItemContent}>
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                      {!!item.subLabel && <Text style={styles.dropdownItemSubText}>{item.subLabel}</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
});
DropdownModal.displayName = 'DropdownModal';

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
  source: TExistingFileSource,
): TExistingFile => {
  const rawString = typeof file === 'string' ? file : '';
  const backendFilenameCandidates = [
    file?.filename,
    file?.fileName,
    file?.file?.filename,
    file?.file?.fileName,
    rawString,
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
    source,
  };
};

const dedupeExistingFiles = (files: TExistingFile[]) => {
  const fileMap = new Map<string, TExistingFile>();
  files.forEach(file => {
    const key = file.filename || file.fileKey || `${file.source}-${file.originalname}`;
    if (!fileMap.has(key)) {
      fileMap.set(key, file);
    }
  });
  return Array.from(fileMap.values());
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  'Bản nháp': { bg: '#ECECEC', color: '#666666' },
  'Tiếp nhận': { bg: '#FFF0DD', color: '#F39C12' },
  'Đã duyệt': { bg: '#E5F8E8', color: '#4CAF50' },
  'Vào sổ': { bg: '#E8F7EA', color: '#66BB6A' },
  'Phân công': { bg: '#E3F0FF', color: '#42A5F5' },
  'Đang xử lý': { bg: '#E3F0FF', color: '#42A5F5' },
  'Hoàn thành': { bg: '#E9F8EC', color: '#81C784' },
  'Từ chối': { bg: '#FFEAEA', color: '#FF6B6B' },
};

const INCOMING_ALL_TABS: TTab[] = [
  { key: 'DRAFT', label: 'Bản nháp', statuses: [EDocumentStatus.DRAFT] },
  { key: 'STATIONARY_RECEIVED', label: 'Tiếp nhận', statuses: [EDocumentStatus.STATIONARY_RECEIVED] },
  { key: 'MANAGEMENT_REVIEWING', label: 'Đã duyệt', statuses: [EDocumentStatus.MANAGEMENT_REVIEWING] },
  { key: 'REGISTERED', label: 'Vào sổ', statuses: [EDocumentStatus.REGISTERED] },
  { key: 'ASSIGNED', label: 'Phân công', statuses: [EDocumentStatus.ASSIGNED] },
  { key: 'PROCESSING', label: 'Đang xử lý', statuses: [EDocumentStatus.PROCESSING] },
  { key: 'COMPLETED', label: 'Hoàn thành', statuses: [EDocumentStatus.COMPLETED] },
  { key: 'REJECTED', label: 'Từ chối', statuses: [EDocumentStatus.REJECTED] },
];

const INCOMING_LEVEL_ALLOWED_STATUSES: Record<TLevelKey, EDocumentStatus[]> = {
  LEADER: [EDocumentStatus.ASSIGNED, EDocumentStatus.PROCESSING, EDocumentStatus.COMPLETED],
  DEPARTMENT: [EDocumentStatus.ASSIGNED, EDocumentStatus.PROCESSING, EDocumentStatus.COMPLETED],
  STATIONARY: [
    EDocumentStatus.DRAFT,
    EDocumentStatus.STATIONARY_RECEIVED,
    EDocumentStatus.MANAGEMENT_REVIEWING,
    EDocumentStatus.REGISTERED,
    EDocumentStatus.ASSIGNED,
    EDocumentStatus.PROCESSING,
    EDocumentStatus.COMPLETED,
    EDocumentStatus.REJECTED,
  ],
  MANAGEMENT: [
    EDocumentStatus.STATIONARY_RECEIVED,
    EDocumentStatus.REGISTERED,
    EDocumentStatus.ASSIGNED,
    EDocumentStatus.PROCESSING,
    EDocumentStatus.COMPLETED,
  ],
};

const getLevelKey = (level?: EOrganization): TLevelKey =>
  level === EOrganization.STATIONARY
    ? 'STATIONARY'
    : level === EOrganization.MANAGEMENT
      ? 'MANAGEMENT'
      : level === EOrganization.DEPARTMENT
        ? 'DEPARTMENT'
        : 'LEADER';

const mapIncomingStatusLabel = (status?: EDocumentStatus) =>
  status === EDocumentStatus.DRAFT
    ? 'Bản nháp'
    : status === EDocumentStatus.STATIONARY_RECEIVED
      ? 'Tiếp nhận'
      : status === EDocumentStatus.MANAGEMENT_REVIEWING
        ? 'Đã duyệt'
        : status === EDocumentStatus.REGISTERED
          ? 'Vào sổ'
          : status === EDocumentStatus.ASSIGNED
            ? 'Phân công'
            : status === EDocumentStatus.PROCESSING
              ? 'Đang xử lý'
              : status === EDocumentStatus.COMPLETED
                ? 'Hoàn thành'
                : status === EDocumentStatus.REJECTED
                  ? 'Từ chối'
                  : 'Tiếp nhận';

const getIncomingCardAction = (status?: EDocumentStatus): TIncomingCardAction => {
  if (status === EDocumentStatus.MANAGEMENT_REVIEWING) {
    return {
      isEditable: true,
      forcedMode: 'LAYOUT_3',
      nextActionLabel: 'Vào sổ',
    };
  }
  if (status === EDocumentStatus.REGISTERED) {
    return {
      isEditable: true,
      forcedMode: 'LAYOUT_4',
      nextActionLabel: 'Phân công',
    };
  }
  if (
    status === EDocumentStatus.DRAFT ||
    status === EDocumentStatus.REJECTED
  ) {
    return {
      isEditable: true,
      forcedMode: 'LAYOUT_1',
      nextActionLabel: 'Cập nhật',
    };
  }
  return { isEditable: false };
};

const canDeleteIncomingByStatus = (status?: EDocumentStatus) =>
  status === EDocumentStatus.DRAFT || status === EDocumentStatus.REJECTED;

const formatDateTime = (iso?: string) => {
  if (!iso) return '--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mi} ${dd}/${mm}/${yyyy}`;
};

const formatDate = (iso?: string) => {
  if (!iso) return '--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const todayIsoDate = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const normalizeDateInput = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (
      d.getFullYear() === Number(yyyy) &&
      d.getMonth() === Number(mm) - 1 &&
      d.getDate() === Number(dd)
    ) {
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  }

  const displayMatch = raw.match(/^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/);
  if (displayMatch) {
    const [, ddRaw, mmRaw, yyyyRaw] = displayMatch;
    const dd = Number(ddRaw);
    const mm = Number(mmRaw);
    const yyyy = Number(yyyyRaw);
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd) {
      return `${yyyyRaw}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }
    return '';
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatFileSize = (size?: number) => {
  if (!size || size <= 0) return '-';
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} mb`;
  return `${(size / 1024).toFixed(1)} kb`;
};

const isObjectId = (value?: string) => !!value && /^[a-fA-F0-9]{24}$/.test(value);

const normalizePrimitive = (value: any) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }
  return '';
};

const normalizeCollection = (value: any): any[] => {
  if (value === null || value === undefined || value === '') return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch {
    }
    return trimmed.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [value];
};

const getEntityId = (value: any) => {
  const primitive = normalizePrimitive(value);
  if (primitive) return primitive;
  if (!value || typeof value !== 'object') return '';
  return String(
    value._id ||
    value.id ||
    value.value ||
    value.userId ||
    value.departmentId ||
    value.user?._id ||
    value.department?._id ||
    '',
  ).trim();
};

const getEntityName = (value: any) => {
  const primitive = normalizePrimitive(value);
  if (primitive) return isObjectId(primitive) ? '' : primitive;
  if (!value || typeof value !== 'object') return '';
  return String(
    value.fullName ||
    value.name ||
    value.departmentName ||
    value.label ||
    value.title ||
    value.user?.fullName ||
    value.user?.name ||
    value.department?.name ||
    '',
  ).trim();
};

const normalizeObjectIdList = (value: any) => {
  const rawItems = normalizeCollection(value);
  return rawItems.map(getEntityId).filter(isObjectId);
};

const joinEntityNames = (...values: any[]) => {
  const names: string[] = [];
  values.forEach(value => {
    const rawItems = normalizeCollection(value);
    rawItems.forEach(item => {
      const name = getEntityName(item);
      if (name && !names.includes(name)) {
        names.push(name);
      }
    });
  });
  return names.join(', ');
};

const inferFormMode = (doc: any, isStationary: boolean): TFormMode => {
  if (!isStationary) return 'LAYOUT_4';
  const status = doc?.status as EDocumentStatus | undefined;
  if (status === EDocumentStatus.STATIONARY_RECEIVED) {
    return 'LAYOUT_2';
  }
  if (status === EDocumentStatus.REGISTERED) {
    return 'LAYOUT_4';
  }
  if (status === EDocumentStatus.MANAGEMENT_REVIEWING) {
    return 'LAYOUT_3';
  }
  return 'LAYOUT_1';
};

const buildCategoryPath = (leafId: string, byId: Record<string, any>) => {
  const path: string[] = [];
  const visited = new Set<string>();
  let currentId: string | null = leafId;
  while (currentId && byId[currentId] && !visited.has(currentId)) {
    path.unshift(currentId);
    visited.add(currentId);
    currentId = byId[currentId]?.parentId || null;
  }
  return path;
};

const buildCategoryById = (categoryList: any[]) =>
  categoryList.reduce((acc: Record<string, any>, category: any) => {
    if (category?._id) {
      acc[category._id] = category;
    }
    return acc;
  }, {});

export default function Incoming({ navigation }: any) {
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
  const finishedAtInputRef = useRef<TextInput>(null);
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
    if (!editorCommand || !editorRef.current) return;
    editorRef.current.injectJavaScript(`window.__apply(${JSON.stringify(editorCommand)});true;`);
  }, [editorCommand]);

  useEffect(() => {
    if (initialEditorHtml === null || !editorReadyRef.current || !editorRef.current) return;
    editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(initialEditorHtml)});true;`);
    setInitialEditorHtml(null);
  }, [initialEditorHtml]);

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

  const renderDatePickerModal = () => {
    const isVisible = showCreatedDatePicker || showFinishedDatePicker;
    if (!isVisible) return null;

    return (
      <Modal
        visible
        transparent
        animationType='fade'
        onRequestClose={closeDatePicker}>
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalCard}>
            <Text style={styles.dateModalTitle}>
              {showCreatedDatePicker ? 'Chọn ngày tạo văn bản' : 'Chọn ngày kết thúc'}
            </Text>
            <TextInput
              style={[styles.dateModalInput, datePickerError && styles.inputWrapError]}
              value={datePickerDraft}
              placeholder='DD/MM/YYYY'
              placeholderTextColor='#A0A0A0'
              keyboardType='number-pad'
              maxLength={10}
              autoFocus
              onChangeText={(value) => {
                const digits = value.replace(/\D/g, '').slice(0, 8);
                const parts = [
                  digits.slice(0, 2),
                  digits.slice(2, 4),
                  digits.slice(4, 8),
                ].filter(Boolean);
                setDatePickerDraft(parts.join('/'));
                setDatePickerError('');
              }}
              onSubmitEditing={submitDatePickerDraft}
            />
            {!!datePickerError && <Text style={styles.dateModalError}>{datePickerError}</Text>}
            <View style={styles.dateQuickRow}>
              <TouchableOpacity style={styles.dateQuickButton} onPress={() => applyRelativeDate(0)}>
                <Text style={styles.dateQuickText}>Hôm nay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateQuickButton} onPress={() => applyRelativeDate(1)}>
                <Text style={styles.dateQuickText}>Ngày mai</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateModalActions}>
              <TouchableOpacity style={styles.dateCancelButton} onPress={closeDatePicker}>
                <Text style={styles.dateCancelText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateApplyButton} onPress={submitDatePickerDraft}>
                <Text style={styles.dateApplyText}>Chọn ngày</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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

  const renderHeaderCreateButton = useCallback(() => {
    if (!isStationary || showForm) {
      return null;
    }

    return (
      <TouchableOpacity
        accessibilityLabel="Tạo văn bản đến"
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
  }, [isLoading, isPreparingForm, isStationary, openCreateForm, showForm]);

  useEffect(() => {
    navigation?.setOptions?.({
      headerShown: true,
      title: 'Văn bản đến',
      headerRight: renderHeaderCreateButton,
    });
  }, [navigation, renderHeaderCreateButton]);

  const renderDropdownMenu = ({
    title,
    options,
    loading = false,
    emptyText = 'Không có dữ liệu để chọn',
  }: {
    title?: string;
    options: TDropdownListOption[];
    loading?: boolean;
    emptyText?: string;
  }) => (
    <DropdownModal
      visible
      title={title}
      options={options}
      loading={loading}
      emptyText={emptyText}
      onClose={resetMenus}
    />
  );

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

  const renderPickedFileRow = (name: string, size?: number, onRemove?: () => void) => (
    <View style={styles.fileRow}>
      <View style={styles.fileLeft}>
        <MaterialCommunityIcons name='file-pdf-box' size={18} color='#FF5252' />
        <Text style={styles.fileName} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.fileRight}>
        <Text style={styles.fileSize}>{formatFileSize(size)}</Text>
        {onRemove ? (
          <TouchableOpacity onPress={onRemove}>
            <MaterialCommunityIcons name='close' size={18} color='#9A9A9A' />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

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

  const submitLayout2 = async (action: 'UPDATE' | 'SEND') => {
    await submitLayout1(action === 'UPDATE');
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

  const editorHTML = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <style>
    html, body { margin: 0; padding: 0; background: #ffffff; font-family: Arial, sans-serif; height: 100%; }
    body { overflow-y: auto; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }
    #editor { min-height: 100%; padding: 12px 12px 96px; font-size: 14px; color: #222; outline: none; line-height: 1.6; background: #fff; box-sizing: border-box; caret-color: #1E88E5; overflow-wrap: anywhere; scroll-padding-bottom: 96px; }
    #editor:empty:before { content: "Nhập nội dung văn bản..."; color: #A0A0A0; }
    p { margin: 0 0 8px; } h1 { font-size: 22px; margin: 0 0 10px; } h2 { font-size: 18px; margin: 0 0 10px; }
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
    function postContent(reason){
      postToNative({ type: 'content', html: editor.innerHTML, reason: reason || 'manual' });
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
    window.__postContent = postContent;
    window.__apply = function(raw){
      if(!raw) return;
      var command = raw.split('|')[0];
      editor.focus();
      if(command === 'bold'){ document.execCommand('bold'); ensureCaretVisible(); return; }
      if(command === 'italic'){ document.execCommand('italic'); ensureCaretVisible(); return; }
      if(command === 'undo'){ document.execCommand('undo'); ensureCaretVisible(); return; }
      if(command === 'redo'){ document.execCommand('redo'); ensureCaretVisible(); return; }
      if(command.indexOf('foreColor:') === 0){ document.execCommand('foreColor', false, command.split(':')[1]); ensureCaretVisible(); return; }
      if(command.indexOf('formatBlock:') === 0){ document.execCommand('formatBlock', false, command.split(':')[1]); ensureCaretVisible(); return; }
      postContent('command');
    };
    window.__setContent = function(html){
      editor.innerHTML = html || '';
      postContent('setContent');
      ensureCaretVisible();
    };
    editor.addEventListener('input', function(){
      ensureCaretVisible();
    });
    editor.addEventListener('focus', function(){
      postToNative({ type: 'focus' });
      setTimeout(ensureCaretVisible, 80);
    });
    editor.addEventListener('blur', function(){
      postContent('blur');
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
  const editorSource = useMemo(() => ({ html: editorHTML }), [editorHTML]);

  const layoutTitle =
    formMode === 'CREATE'
      ? 'Tạo văn bản đến'
      : 'Cập nhật văn bản đến';
  const receiverLabel = 'Ban giám đốc';
  const hideBottomActions = isKeyboardVisible && !isEditorFocused;

  if (isLoading && !showForm && docs.length === 0) {
    return <Loading />;
  }

  if (showForm && isStationary) {
    return (
      <View style={styles.container}>
        <View style={styles.flexOne}>
          <View style={styles.createHeader}>
            <Text style={styles.createTitle}>{layoutTitle}</Text>
            <TouchableOpacity
              onPress={() => {
                setShowForm(false);
                resetForm();
              }}>
              <Text style={styles.createReset}>Đóng lại</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            ref={formScrollRef}
            enableOnAndroid
            extraScrollHeight={96}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode='on-drag'
            onScrollBeginDrag={dismissKeyboardAndMenus}
            contentContainerStyle={styles.createScroll}>
            {showRegisterSection && (
              <>
                <Text style={styles.blockTitle}>Vào sổ văn bản</Text>
                {!!destinationPathLabel && <Text style={styles.blockHint}>Chi tiết nhánh: {destinationPathLabel}</Text>}
                {!!destinationCategoryHint && <Text style={styles.blockHint}>Chi tiết nhánh: {destinationCategoryHint}</Text>}

                <Text style={styles.fieldLabel}>Chọn sổ (thư mục) lưu trữ <Text style={styles.required}>*</Text></Text>
                {destinationLevelOptions.map((options, levelIndex) => {
                  const selectedIdAtLevel = destinationSelectionIds[levelIndex] || '';
                  const selectedName =
                    options.find((item: any) => item._id === selectedIdAtLevel)?.name ||
                    (levelIndex === 0 ? destinationCategoryHint : '') ||
                    'Chọn sổ (thư mục)';
                  return (
                    <View key={`level-${levelIndex}`} style={styles.dropdownWrap}>
                      <TouchableOpacity
                        style={[
                          styles.select,
                          showDestinationLevel === levelIndex && styles.selectFocused,
                          errors.destinationCategoryId && levelIndex === 0 && styles.inputWrapError,
                        ]}
                        onPress={() => {
                          toggleDestinationMenu(levelIndex);
                        }}>
                        <Text style={styles.selectText}>{selectedName}</Text>
                        <MaterialCommunityIcons name='chevron-down' size={18} color='#666' />
                      </TouchableOpacity>
                      {showDestinationLevel === levelIndex && renderDropdownMenu({
                        title: 'Chọn sổ lưu trữ',
                        options: destinationDropdownOptions[levelIndex] || [],
                        emptyText: 'Không có sổ lưu trữ để chọn',
                      })}
                    </View>
                  );
                })}
                {!!errors.destinationCategoryId && <Text style={styles.fieldError}>{errors.destinationCategoryId}</Text>}

                <View style={styles.separator} />
              </>
            )}

            {showAssignSection && (
              <>
                <Text style={styles.blockTitle}>{isLayout4 ? 'Phân công cơ quan xử lý' : 'Phân công phòng ban xử lý'}</Text>

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.fieldLabel}>Cơ quan chủ trì <Text style={styles.required}>*</Text></Text>
                    <View style={styles.dropdownWrap}>
                      <TouchableOpacity
                        style={[
                          styles.select,
                          showLeadDepartmentMenu && styles.selectFocused,
                          errors.leadDepartmentId && styles.inputWrapError,
                        ]}
                        onPress={() => toggleMenu(showLeadDepartmentMenu, setShowLeadDepartmentMenu)}>
                        <Text style={styles.selectText}>{selectedLeadDepartmentName || 'Chọn cơ quan chủ trì'}</Text>
                        <MaterialCommunityIcons name='chevron-down' size={18} color='#666' />
                      </TouchableOpacity>
                      {showLeadDepartmentMenu && renderDropdownMenu({
                        title: 'Chọn cơ quan chủ trì',
                        loading: isLoadingAssignmentOptions,
                        options: leadDepartmentDropdownOptions,
                        emptyText: 'Chưa có danh sách cơ quan',
                      })}
                    </View>
                    {!!errors.leadDepartmentId && <Text style={styles.fieldError}>{errors.leadDepartmentId}</Text>}
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.fieldLabel}>Ngày kết thúc <Text style={styles.required}>*</Text></Text>
                    <View style={[
                      styles.inputWrap,
                      focusedField === 'finishedAt' && styles.inputWrapFocused,
                      errors.finishedAt && styles.inputWrapError,
                      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                    ]}>
                      <TextInput
                        ref={finishedAtInputRef}
                        style={[styles.input, { flex: 1 }]}
                        placeholder='DD/MM/YYYY'
                        placeholderTextColor='#A0A0A0'
                        value={finishedAtDisplay || ''}
                        maxLength={10}
                        editable={false}
                        showSoftInputOnFocus={false}
                        returnKeyType='done'
                        onFocus={openFinishedDatePicker}
                        onPressIn={openFinishedDatePicker}
                        onBlur={() => {
                          setFocusedField(prev => (prev === 'finishedAt' ? null : prev));
                        }}
                        onSubmitEditing={() => {
                          Keyboard.dismiss();
                          setFocusedField(null);
                        }}
                        onChangeText={(value) => {
                          // keep raw display while typing; try to parse to ISO for internal value
                          setFinishedAtDisplay(value);
                          const iso = normalizeDateInput(value);
                          if (iso) setFinishedAtValue(iso);
                          setErrors(prev => ({ ...prev, finishedAt: undefined }));
                        }}
                      />
                      <TouchableOpacity onPress={openFinishedDatePicker} style={{ marginLeft: 8 }}>
                        <MaterialCommunityIcons name='calendar' size={20} color='#666' />
                      </TouchableOpacity>
                    </View>
                    {!!errors.finishedAt && <Text style={styles.fieldError}>{errors.finishedAt}</Text>}
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Người nhận để biết <Text style={styles.mutedHint}>(chọn nhiều)</Text></Text>
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    style={[styles.select, showReceiveMenu && styles.selectFocused]}
                    onPress={() => {
                      toggleMenu(showReceiveMenu, setShowReceiveMenu);
                    }}>
                    <Text style={styles.selectText}>{selectedReceiveToKnowText}</Text>
                    <MaterialCommunityIcons name='chevron-down' size={18} color='#666' />
                  </TouchableOpacity>
                  {showReceiveMenu && renderDropdownMenu({
                    title: 'Người nhận để biết',
                    loading: isLoadingAssignmentOptions,
                    options: receiveDropdownOptions,
                    emptyText: 'Chưa có danh sách người nhận',
                  })}
                </View>

                <Text style={styles.fieldLabel}>Chọn cơ quan phối hợp <Text style={styles.mutedHint}>(chọn nhiều)</Text></Text>
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    style={[styles.select, showSupportDepartmentMenu && styles.selectFocused]}
                    onPress={() => {
                      toggleMenu(showSupportDepartmentMenu, setShowSupportDepartmentMenu);
                    }}>
                    <Text style={styles.selectText}>{selectedSupportDepartmentText}</Text>
                    <MaterialCommunityIcons name='chevron-down' size={18} color='#666' />
                  </TouchableOpacity>
                  {showSupportDepartmentMenu && renderDropdownMenu({
                    title: 'Cơ quan phối hợp',
                    loading: isLoadingAssignmentOptions,
                    options: supportDepartmentDropdownOptions,
                    emptyText: 'Chưa có danh sách cơ quan phối hợp',
                  })}
                </View>

                <View style={styles.separator} />
              </>
            )}

            <Text style={styles.fieldLabel}>Tiêu đề tài liệu <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputWrap,
              focusedField === 'title' && styles.inputWrapFocused,
              errors.title && styles.inputWrapError,
            ]}>
              <TextInput
                ref={titleInputRef}
                style={styles.input}
                placeholder='Nhập nội dung'
                placeholderTextColor='#A0A0A0'
                value={titleValue}
                returnKeyType='next'
                blurOnSubmit={false}
                onFocus={() => handleInputFocus('title')}
                onBlur={() => {
                  setFocusedField(prev => (prev === 'title' ? null : prev));
                }}
                onSubmitEditing={() => organizationInputRef.current?.focus()}
                onChangeText={(value) => {
                  setTitleValue(value);
                  setErrors(prev => ({ ...prev, title: undefined }));
                }}
              />
            </View>
            {!!errors.title && <Text style={styles.fieldError}>Bắt buộc!</Text>}

            <Text style={styles.fieldLabel}>Tên tổ chức <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputWrap,
              focusedField === 'organization' && styles.inputWrapFocused,
              errors.organization && styles.inputWrapError,
            ]}>
              <TextInput
                ref={organizationInputRef}
                style={styles.input}
                placeholder='Nhập tên tổ chức'
                placeholderTextColor='#A0A0A0'
                value={organizationValue}
                returnKeyType='next'
                blurOnSubmit={false}
                onFocus={() => handleInputFocus('organization')}
                onBlur={() => {
                  setFocusedField(prev => (prev === 'organization' ? null : prev));
                }}
                onSubmitEditing={() => senderInputRef.current?.focus()}
                onChangeText={(value) => {
                  setOrganizationValue(value);
                  setErrors(prev => ({ ...prev, organization: undefined }));
                }}
              />
            </View>
            {!!errors.organization && <Text style={styles.fieldError}>Bắt buộc!</Text>}

            <Text style={styles.fieldLabel}>Người gửi <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputWrap,
              focusedField === 'sender' && styles.inputWrapFocused,
              errors.sender && styles.inputWrapError,
            ]}>
              <TextInput
                ref={senderInputRef}
                style={styles.input}
                placeholder='Nhập người gửi'
                placeholderTextColor='#A0A0A0'
                value={senderValue}
                returnKeyType='next'
                blurOnSubmit={false}
                onFocus={() => handleInputFocus('sender')}
                onBlur={() => {
                  setFocusedField(prev => (prev === 'sender' ? null : prev));
                }}
                onSubmitEditing={() => registeredNumberInputRef.current?.focus()}
                onChangeText={(value) => {
                  setSenderValue(value);
                  setErrors(prev => ({ ...prev, sender: undefined }));
                }}
              />
            </View>
            {!!errors.sender && <Text style={styles.fieldError}>Bắt buộc!</Text>}

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.fieldLabel}>Số hiệu văn bản <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'registeredNumber' && styles.inputWrapFocused,
                  errors.registeredNumber && styles.inputWrapError,
                ]}>
                  <TextInput
                    ref={registeredNumberInputRef}
                    style={styles.input}
                    placeholder='Nhập số hiệu'
                    placeholderTextColor='#A0A0A0'
                    value={registeredNumberValue}
                    returnKeyType='done'
                    onFocus={() => handleInputFocus('registeredNumber')}
                    onBlur={() => {
                      setFocusedField(prev => (prev === 'registeredNumber' ? null : prev));
                    }}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      setFocusedField(null);
                    }}
                    onChangeText={(value) => {
                      setRegisteredNumberValue(value);
                      setErrors(prev => ({ ...prev, registeredNumber: undefined }));
                    }}
                  />
                </View>
                {!!errors.registeredNumber && <Text style={styles.fieldError}>Bắt buộc!</Text>}
              </View>

              <View style={styles.half}>
                <Text style={styles.fieldLabel}>Ngày tạo văn bản <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={[
                    styles.select,
                    focusedField === 'createdAt' && styles.selectFocused,
                  ]}
                  onPress={openCreatedDatePicker}>
                  <Text style={styles.selectText}>{formatDate(createdAtValue)}</Text>
                  <MaterialCommunityIcons name='calendar-month-outline' size={18} color='#666' />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.fieldLabel}>Loại tài liệu <Text style={styles.required}>*</Text></Text>
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    style={[
                      styles.select,
                      showCategoryMenu && styles.selectFocused,
                      errors.categoryId && styles.inputWrapError,
                    ]}
                    onPress={() => {
                      toggleMenu(showCategoryMenu, setShowCategoryMenu);
                    }}>
                    <Text style={styles.selectText}>{categoryNameValue || 'Chọn loại'}</Text>
                    <MaterialCommunityIcons name='chevron-down' size={18} color='#666' />
                  </TouchableOpacity>
                  {showCategoryMenu && renderDropdownMenu({
                    title: 'Chọn loại tài liệu',
                    options: categoryDropdownOptions,
                    emptyText: 'Chưa có loại tài liệu',
                  })}
                </View>
                {!!errors.categoryId && <Text style={styles.fieldError}>Vui lòng chọn!</Text>}
              </View>

              <View style={styles.half}>
                <Text style={styles.fieldLabel}>Mức độ ưu tiên <Text style={styles.required}>*</Text></Text>
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    style={[
                      styles.select,
                      showPriorityMenu && styles.selectFocused,
                      errors.priority && styles.inputWrapError,
                    ]}
                    onPress={() => {
                      toggleMenu(showPriorityMenu, setShowPriorityMenu);
                    }}>
                    <Text style={styles.selectText}>{priorityValue ? DOCUMENT_PRIORITY_LABEL[priorityValue] : 'Chọn mức độ'}</Text>
                    <MaterialCommunityIcons name='chevron-down' size={18} color='#666' />
                  </TouchableOpacity>
                  {showPriorityMenu && renderDropdownMenu({
                    title: 'Chọn mức độ ưu tiên',
                    options: priorityDropdownOptions,
                  })}
                </View>
                {!!errors.priority && <Text style={styles.fieldError}>{errors.priority}</Text>}
              </View>
            </View>

            <View style={styles.receiverRow}>
              <Text style={styles.receiverLabel}>Bộ phận tiếp nhận:</Text>
              <Text style={styles.receiverValue}>{receiverLabel}</Text>
            </View>

            <TouchableOpacity style={[styles.uploadSign, errors.mainFiles && styles.inputWrapError]} onPress={handlePickMainFiles}>
              <View style={styles.uploadLeft}>
                <MaterialCommunityIcons name='file-plus-outline' size={17} color='#333' />
                <Text style={styles.uploadSignText}>Thêm văn bản trình ký (.pdf)</Text>
              </View>
              <MaterialCommunityIcons name='plus' size={20} color='#4CAF50' />
            </TouchableOpacity>
            {!!errors.mainFiles && <Text style={styles.fieldErrorLeft}>{errors.mainFiles}</Text>}
            {existingMainFiles.map(file => (
              <View key={file.fileKey}>
                {renderPickedFileRow(
                  file.originalname,
                  undefined,
                  canRemoveExistingMainFile(file) ? () => handleRemoveExistingMainFile(file) : undefined,
                )}
              </View>
            ))}
            {mainFilesNew.map(file => (
              <View key={`${file.uri}-${file.name}`}>
                {renderPickedFileRow(file.name, file.size, () => setMainFilesNew(prev => prev.filter(i => i.uri !== file.uri)))}
              </View>
            ))}

            <TouchableOpacity style={[styles.uploadAttach, errors.attachedFiles && styles.inputWrapError]} onPress={handlePickAttachedFiles}>
              <View style={styles.uploadLeft}>
                <MaterialCommunityIcons name='file-plus-outline' size={17} color='#333' />
                <Text style={styles.uploadAttachText}>Thêm văn bản đính kèm (.pdf)</Text>
              </View>
              <MaterialCommunityIcons name='plus' size={20} color='#FF9800' />
            </TouchableOpacity>
            {!!errors.attachedFiles && <Text style={styles.fieldErrorLeft}>{errors.attachedFiles}</Text>}
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
                  <MaterialCommunityIcons name='undo-variant' size={18} color='#3D495A' />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarIconBtn} onPress={() => sendEditorCommand('redo')}>
                  <MaterialCommunityIcons name='redo-variant' size={18} color='#3D495A' />
                </TouchableOpacity>

                <View style={styles.toolbarDivider} />

                <TouchableOpacity
                  style={styles.toolbarDropdown}
                  onPress={() => {
                    setShowColorMenu(false);
                    setShowFormatMenu(!showFormatMenu);
                  }}>
                  <Text style={styles.toolbarDropdownText}>{activeFormat}</Text>
                  <MaterialCommunityIcons name='chevron-down' size={16} color='#7C8797' />
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <TouchableOpacity onPress={() => sendEditorCommand('bold')}>
                  <Text style={styles.toolbarStrong}>B</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => sendEditorCommand('italic')}>
                  <Text style={styles.toolbarItalic}>I</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toolbarAButton}
                  onPress={() => {
                    setShowFormatMenu(false);
                    setShowColorMenu(!showColorMenu);
                  }}>
                  <Text style={styles.toolbarUnderline}>A</Text>
                  <MaterialCommunityIcons name='chevron-down' size={14} color='#7C8797' />
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
                  {['#111827', '#374151', '#6B7280', '#1E88E5', '#1976D2', '#0EA5E9', '#43A047', '#22C55E', '#84CC16', '#F59E0B', '#F4511E', '#DC2626', '#D81B60', '#8E24AA', '#7C3AED'].map(color => (
                    <TouchableOpacity key={color} style={[styles.colorDot, { backgroundColor: color }]} onPress={() => chooseColor(color)} />
                  ))}
                </View>
              )}

              <View style={styles.editorBody}>
                {shouldMountEditor ? (
                  <WebView
                    ref={editorRef}
                    originWhitelist={['*']}
                    source={editorSource}
                    javaScriptEnabled
                    scrollEnabled={isEditorFocused}
                    nestedScrollEnabled
                    onLoadEnd={() => {
                      editorReadyRef.current = true;
                      if (initialEditorHtml === null || !editorRef.current) return;
                      editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(initialEditorHtml)});true;`);
                      setInitialEditorHtml(null);
                    }}
                    onMessage={(event) => {
                      try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === 'content') {
                          const html = data.html || '';
                          editorContentRef.current = html;
                          if (data.reason !== 'input') {
                            commitEditorContent(html);
                          }
                          if (data.reason === 'request' && editorContentRequestRef.current) {
                            editorContentRequestRef.current(html);
                          }
                          return;
                        }
                        if (data.type === 'focus') {
                          editorFocusedRef.current = true;
                          setIsEditorFocused(true);
                          scrollFormToEditor(Platform.OS === 'ios' ? 80 : 140);
                          return;
                        }
                        if (data.type === 'blur') {
                          editorFocusedRef.current = false;
                          setIsEditorFocused(false);
                        }
                      } catch (e) {
                      }
                    }}
                    style={styles.webview}
                  />
                ) : (
                  <View style={styles.editorWarmup} />
                )}
              </View>
            </View>
          </KeyboardAwareScrollView>

          {!hideBottomActions && formMode === 'CREATE' && (
            <View style={styles.bottomActions}>
              <TouchableOpacity style={[styles.btnDraft, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={() => submitLayout1(true)}>
                <Text style={styles.btnDraftText}>{editingId ? 'Cập nhật' : 'Lưu bản nháp'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSubmit, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={() => submitLayout1(false)}>
                <Text style={styles.btnSubmitText}>Xác nhận gửi</Text>
              </TouchableOpacity>
            </View>
          )}

          {!hideBottomActions && formMode === 'LAYOUT_1' && (
            <View style={styles.bottomActions}>
              <TouchableOpacity style={[styles.btnDraft, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={() => submitLayout1(true)}>
                <Text style={styles.btnDraftText}>Cập nhật</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSubmit, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={() => submitLayout1(false)}>
                <Text style={styles.btnSubmitText}>Xác nhận gửi</Text>
              </TouchableOpacity>
            </View>
          )}

          {!hideBottomActions && formMode === 'LAYOUT_2' && (
            <View style={styles.bottomActions}>
              <TouchableOpacity style={[styles.btnDraft, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={() => submitLayout2('UPDATE')}>
                <Text style={styles.btnDraftText}>Cập nhật</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSubmit, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={() => submitLayout2('SEND')}>
                <Text style={styles.btnSubmitText}>Xác nhận gửi</Text>
              </TouchableOpacity>
            </View>
          )}

          {!hideBottomActions && formMode === 'LAYOUT_3' && (
            <View style={styles.bottomActionsSingle}>
              <TouchableOpacity style={[styles.btnSubmitSingle, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={submitLayout3}>
                <Text style={styles.btnSubmitText}>Xác nhận vào sổ</Text>
              </TouchableOpacity>
            </View>
          )}

          {!hideBottomActions && formMode === 'LAYOUT_4' && (
            <View style={styles.bottomActionsSingle}>
              <TouchableOpacity style={[styles.btnSubmitSingle, isFormBusy && { opacity: 0.7 }]} disabled={isFormBusy} onPress={submitLayout4}>
                <Text style={styles.btnSubmitText}>Xác nhận phân công</Text>
              </TouchableOpacity>
            </View>
          )}
          {renderDatePickerModal()}
          <Backdrop open={isFormBusy} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name='magnify' size={20} color='#9A9A9A' />
          <TextInput style={styles.searchInput} placeholder='Tìm kiếm văn bản...' placeholderTextColor='#9A9A9A' value={searchText} onChangeText={setSearchText} />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name='tune-variant' size={20} color='#858585' />
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRowContent}>
          {tabs.map(tab => (
            <TouchableOpacity key={tab.key} style={[styles.chip, activeTab?.key === tab.key && styles.chipActive]} onPress={() => setActiveTabKey(tab.key)}>
              <Text style={[styles.chipText, activeTab?.key === tab.key && styles.chipTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.totalText}>Tổng số văn bản đến: {filteredDocs.length}</Text>

      <FlatList
        data={filteredDocs}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const status = STATUS_COLOR[item.statusLabel] || STATUS_COLOR['Bản nháp'];
          const cardAction = getIncomingCardAction(item.rawStatus);
          const canEdit = isStationary && cardAction.isEditable;
          const canDelete = isStationary && canDeleteIncomingByStatus(item.rawStatus);
          const updateLabel = canEdit ? (cardAction.nextActionLabel || 'Cập nhật') : '';
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('DETAILDOCUMENTS', {
                  documentId: item.id,
                  sourceModule: 'incomingDocument',
                })
              }>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{item.statusLabel}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLeft}>Số hiệu: {item.code || '--'}</Text>
                <Text style={styles.metaRight}>{formatDateTime(item.createdAt)}</Text>
              </View>
              <View style={styles.bottomRow}>
                <Text style={styles.stepText}>{item.finishedAt ? `Kết thúc vào ${formatDateTime(item.finishedAt)}` : '...'}</Text>
                <View style={styles.actionRow}>
                  {canEdit && updateLabel ? (
                    <>
                      <TouchableOpacity
                        style={[styles.updateActionButton, (isLoading || isPreparingForm) && styles.updateActionButtonDisabled]}
                        disabled={isLoading || isPreparingForm}
                        onPress={(event: any) => {
                          event?.stopPropagation?.();
                          startEdit(item.id, cardAction.forcedMode);
                        }}>
                        <Text style={styles.updateActionButtonText}>{updateLabel}</Text>
                      </TouchableOpacity>
                      {canDelete && (
                        <TouchableOpacity
                          disabled={isLoading || isPreparingForm}
                          onPress={(event: any) => {
                            event?.stopPropagation?.();
                            setDeletingId(item.id);
                            setDeletingTitle(item.title || '');
                          }}>
                          <MaterialCommunityIcons name='trash-can-outline' size={16} color='#F15B5B' />
                        </TouchableOpacity>
                      )}
                    </>
                  ) : null}
                  <MaterialCommunityIcons name='chevron-right' size={18} color='#9E9E9E' />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!deletingId} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Xóa văn bản đến</Text>
            <Text style={styles.modalMessage}>Bạn có chắc chắn muốn xóa văn bản đến này không?</Text>
            <Text style={styles.modalDocTitle}>{deletingTitle || 'Văn bản đến'}</Text>
            <View style={styles.modalWarningWrap}>
              <Text style={styles.modalWarningText}>Tất cả dữ liệu trong văn bản đến này sẽ xóa bỏ hoàn toàn!</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnGhost}
                disabled={isDeleting || isLoading}
                onPress={() => {
                  setDeletingId(null);
                  setDeletingTitle('');
                }}>
                <Text style={styles.modalBtnGhostText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnDanger, (isDeleting || isLoading) && { opacity: 0.7 }]}
                disabled={isDeleting || isLoading}
                onPress={async () => {
                  if (!deletingId || isDeleting || isLoading) return;
                  setIsDeleting(true);
                  await deleteDocument(deletingId);
                  setIsDeleting(false);
                  setDeletingId(null);
                  setDeletingTitle('');
                  getListDocument({ type: 'INCOMING' });
                }}>
                <Text style={styles.modalBtnDangerText}>{isDeleting ? 'Đang xóa...' : 'Chắc chắn xóa'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Backdrop open={isLoading || isPreparingForm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF', paddingHorizontal: 12, paddingTop: 8 },
  flexOne: { flex: 1 },
  headerRow: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerIconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E1E1E' },
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
  updateActionButton: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#EAF7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateActionButtonDisabled: {
    opacity: 0.6,
  },
  updateActionButtonText: {
    fontSize: 12,
    color: '#2D8F31',
    fontWeight: '600',
  },

  createHeader: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#DBDBDB', marginHorizontal: -12, paddingHorizontal: 12, paddingVertical: 8 },
  createTitle: { fontSize: 18, fontWeight: '700', color: '#161616', flex: 1, marginRight: 12 },
  createReset: { fontSize: 13, color: '#66BB6A' },
  createScroll: { paddingBottom: 12, paddingTop: 12 },
  separator: { borderBottomWidth: 1, borderBottomColor: '#8CC7FF', borderStyle: 'dashed', marginTop: 10, marginBottom: 10 },
  blockTitle: { fontSize: 18, fontWeight: '700', color: '#2196F3', marginTop: 4, marginBottom: 8 },
  blockHint: { fontSize: 13, color: '#8D8D8D', fontStyle: 'italic', marginBottom: 4 },
  mutedHint: { color: '#777', fontStyle: 'italic' },

  fieldLabel: { fontSize: 13, color: '#222', marginBottom: 5, marginTop: 8 },
  required: { color: '#F05A5A' },
  inputWrap: { borderWidth: 1, borderColor: '#BFBFBF', borderRadius: 6, backgroundColor: '#F7F7F7', paddingHorizontal: 10 },
  inputWrapFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF' },
  inputWrapError: { borderColor: '#FF4D4F' },
  input: { height: 38, fontSize: 13, color: '#222', paddingVertical: 0, paddingLeft: 2, textAlignVertical: 'center', includeFontPadding: false },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  dropdownWrap: { position: 'relative' },
  select: { height: 38, borderWidth: 1, borderColor: '#BFBFBF', borderRadius: 6, backgroundColor: '#F7F7F7', paddingHorizontal: 10, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' },
  selectFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF' },
  selectText: { fontSize: 13, color: '#5A5A5A', flex: 1 },
  dropdownModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', paddingHorizontal: 18 },
  dropdownModalBackdrop: { ...StyleSheet.absoluteFillObject },
  dropdownModalCard: { width: '100%', maxHeight: 420, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#DCDCDC', overflow: 'hidden' },
  dropdownModalTitle: { fontSize: 16, fontWeight: '700', color: '#1E1E1E', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dropdownList: { maxHeight: 360 },
  dropdownMenu: { marginTop: 4, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DCDCDC', borderRadius: 10, overflow: 'hidden' },
  dropdownItem: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', justifyContent: 'center' },
  dropdownItemContent: { flex: 1 },
  dropdownItemText: { fontSize: 14, color: '#333' },
  dropdownItemSubText: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },
  dropdownStateRow: { minHeight: 72, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 12 },
  dropdownStateText: { fontSize: 14, color: '#777', textAlign: 'center' },
  multiItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldError: { color: '#FF4D4F', fontSize: 12, marginTop: 4, textAlign: 'right' },
  fieldErrorLeft: { color: '#FF4D4F', fontSize: 12, marginTop: -4, marginBottom: 8, textAlign: 'left' },

  receiverRow: { height: 34, borderRadius: 6, backgroundColor: '#E9E9E9', marginTop: 10, marginBottom: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiverLabel: { fontSize: 13, color: '#8B8B8B' },
  receiverValue: { fontSize: 13, color: '#1E88E5', fontWeight: '500' },

  uploadSign: { minHeight: 40, borderWidth: 1, borderColor: '#9BD69E', borderStyle: 'dashed', borderRadius: 6, backgroundColor: '#EAF7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 },
  uploadAttach: { minHeight: 40, borderWidth: 1, borderColor: '#F3B260', borderStyle: 'dashed', borderRadius: 6, backgroundColor: '#FFF3E6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 10 },
  uploadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  uploadSignText: { fontSize: 13, color: '#555', flexShrink: 1 },
  uploadAttachText: { fontSize: 13, color: '#555', flexShrink: 1 },

  fileRow: { height: 40, backgroundColor: '#EFEFEF', borderRadius: 8, paddingHorizontal: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  fileName: { marginLeft: 8, color: '#4A4A4A', fontSize: 13, flex: 1 },
  fileRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileSize: { color: '#777', fontSize: 12 },

  editorContainer: { height: 230, borderRadius: 10, borderWidth: 1, borderColor: '#D3D5DB', backgroundColor: '#FFF', overflow: 'hidden', marginTop: 8, marginBottom: 12 },
  editorToolbar: { height: 42, backgroundColor: '#F8F9FB', borderBottomWidth: 1, borderBottomColor: '#D7DAE0', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, position: 'relative', zIndex: 10 },
  toolbarIconBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  toolbarDivider: { width: 1, height: 24, backgroundColor: '#D7DAE0', marginHorizontal: 8 },
  toolbarDropdown: { height: 28, minWidth: 100, backgroundColor: '#ECEFF3', borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  toolbarDropdownText: { fontSize: 14, color: '#3D495A', fontWeight: '500' },
  toolbarStrong: { fontSize: 18, fontWeight: '700', color: '#2E3747' },
  toolbarItalic: { fontSize: 18, fontStyle: 'italic', color: '#2E3747' },
  toolbarAButton: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 2 },
  toolbarUnderline: { fontSize: 18, color: '#2E3747', textDecorationLine: 'underline' },
  menuBox: { position: 'absolute', top: 48, left: 70, width: 150, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8DCE3', borderRadius: 6, zIndex: 20, elevation: 5 },
  menuItem: { paddingHorizontal: 10, paddingVertical: 8 },
  menuText: { fontSize: 13, color: '#2F3A4A' },
  colorMenu: { position: 'absolute', top: 48, right: 12, width: 132, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8DCE3', borderRadius: 6, zIndex: 22, elevation: 6, padding: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#CDD2DA' },
  editorBody: { flex: 1, borderTopWidth: 1, borderTopColor: '#D3D5DB', backgroundColor: '#FFF', overflow: 'hidden' },
  editorWarmup: { flex: 1, backgroundColor: '#FFF' },
  webview: { flex: 1, backgroundColor: '#FFF' },

  bottomActions: { height: 78, borderTopWidth: 1, borderTopColor: '#DADADA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 10, backgroundColor: '#EFEFEF' },
  bottomActionsSingle: { height: 70, borderTopWidth: 1, borderTopColor: '#DADADA', justifyContent: 'center', backgroundColor: '#EFEFEF', paddingHorizontal: 10 },
  btnDraft: { flex: 1, height: 46, borderRadius: 24, borderWidth: 1, borderColor: '#9B9B9B', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F8F8' },
  btnDraftText: { fontSize: 16, color: '#8D8D8D', fontWeight: '500' },
  btnSubmit: { flex: 1.2, height: 46, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50' },
  btnSubmitSingle: { height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50' },
  btnSubmitText: { fontSize: 16, color: '#FFF', fontWeight: '600' },

  dateModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  dateModalCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 },
  dateModalTitle: { fontSize: 18, fontWeight: '700', color: '#1E1E1E', marginBottom: 10 },
  dateModalInput: { height: 44, borderWidth: 1, borderColor: '#BFBFBF', borderRadius: 8, backgroundColor: '#F7F7F7', paddingHorizontal: 12, fontSize: 16, color: '#222' },
  dateModalError: { color: '#FF4D4F', fontSize: 12, marginTop: 6 },
  dateQuickRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  dateQuickButton: { flex: 1, height: 36, borderRadius: 8, backgroundColor: '#EAF2FA', alignItems: 'center', justifyContent: 'center' },
  dateQuickText: { fontSize: 14, color: '#1E88E5', fontWeight: '600' },
  dateModalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  dateCancelButton: { flex: 1, height: 42, borderRadius: 10, backgroundColor: '#D7D7D7', alignItems: 'center', justifyContent: 'center' },
  dateCancelText: { fontSize: 16, color: '#444', fontWeight: '600' },
  dateApplyButton: { flex: 1, height: 42, borderRadius: 10, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  dateApplyText: { fontSize: 16, color: '#FFF', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '88%', backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  modalTitle: { fontSize: 34, color: '#1E1E1E', textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  modalMessage: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 10 },
  modalDocTitle: { fontSize: 14, color: '#222', textAlign: 'center', fontWeight: '700', marginBottom: 10 },
  modalWarningWrap: { backgroundColor: '#FFE8E8', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14 },
  modalWarningText: { fontSize: 13, color: '#FF6B6B', textAlign: 'center', fontWeight: '500' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  modalBtnGhost: { flex: 1, backgroundColor: '#D7D7D7', borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center' },
  modalBtnGhostText: { color: '#444', fontSize: 18, fontWeight: '600' },
  modalBtnDanger: { flex: 1, backgroundColor: '#FF4A43', borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center' },
  modalBtnDangerText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});




