import {EDocumentStatus} from '@/shared-types/common/Document/document';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

export type TLevelKey = 'LEADER' | 'DEPARTMENT' | 'STATIONARY' | 'MANAGEMENT';
export type TTab = {key: string; label: string; statuses: EDocumentStatus[]};
export type TPickedFile = {
    uri: string;
    name: string;
    type: string;
    size?: number;
};
export type TExistingFileSource = 'mainFiles' | 'signedFiles' | 'attachedFiles';
export type TExistingFile = {
    fileKey: string;
    filename: string;
    originalname: string;
    source: TExistingFileSource;
};
export type TIncomingItem = {
    id: string;
    title: string;
    code: string;
    statusLabel: string;
    rawStatus?: EDocumentStatus;
    createdAt?: string;
    finishedAt?: string;
};
export type TFormMode = 'CREATE' | 'LAYOUT_1' | 'LAYOUT_3' | 'LAYOUT_4';
export type TIncomingCardAction = {
    isEditable: boolean;
    forcedMode?: Exclude<TFormMode, 'CREATE'>;
    nextActionLabel?: string;
};
export type TDirectoryUser = {
    _id: string;
    fullName: string;
    departmentId: string;
    departmentName: string;
};
export type TDepartmentOption = {
    id: string;
    name: string;
    code?: string;
};
export type TDropdownListOption = {
    key: string;
    label: string;
    subLabel?: string;
    searchText?: string;
    checked?: boolean;
    onPress?: () => void;
};
export type TIncomingAssignmentDraft = {
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
export type TFocusableIncomingField =
    | 'title'
    | 'organization'
    | 'sender'
    | 'registeredNumber'
    | 'createdAt'
    | 'finishedAt';

export const getSafeBaseName = (value?: string) => {
    const raw = String(value || '').trim();
    if (!raw) {
        return '';
    }
    const noQuery = raw.split('?')[0].split('#')[0];
    const slashParts = noQuery.split('/');
    const lastSlashPart = slashParts[slashParts.length - 1] || '';
    const backslashParts = lastSlashPart.split('\\');
    return backslashParts[backslashParts.length - 1] || lastSlashPart;
};

export const normalizeDisplayName = (value?: string) => {
    const raw = String(value || '').trim();
    if (!raw) {
        return '';
    }
    if (raw.includes('/') || raw.includes('\\')) {
        return getSafeBaseName(raw);
    }
    return raw;
};

export const normalizeExistingFile = (
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
        .filter(
            (item: string) =>
                Boolean(item) && !item.includes('/') && !item.includes('\\'),
        );
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
        originalname:
            displayCandidates[0] ||
            getSafeBaseName(backendFilename) ||
            fallbackName,
        source,
    };
};

export const dedupeExistingFiles = (files: TExistingFile[]) => {
    const fileMap = new Map<string, TExistingFile>();
    files.forEach(file => {
        const key =
            file.filename ||
            file.fileKey ||
            `${file.source}-${file.originalname}`;
        if (!fileMap.has(key)) {
            fileMap.set(key, file);
        }
    });
    return Array.from(fileMap.values());
};

export const STATUS_COLOR: Record<string, {bg: string; color: string}> = {
    'Bản nháp': {bg: '#ECECEC', color: '#666666'},
    'Tiếp nhận': {bg: '#FFF0DD', color: '#F39C12'},
    'Đã duyệt': {bg: '#E5F8E8', color: '#4CAF50'},
    'Vào sổ': {bg: '#E8F7EA', color: '#66BB6A'},
    'Phân công': {bg: '#E3F0FF', color: '#42A5F5'},
    'Đang xử lý': {bg: '#E3F0FF', color: '#42A5F5'},
    'Hoàn thành': {bg: '#E9F8EC', color: '#81C784'},
    'Từ chối': {bg: '#FFEAEA', color: '#FF6B6B'},
};

export const INCOMING_ALL_TABS: TTab[] = [
    {key: 'DRAFT', label: 'Bản nháp', statuses: [EDocumentStatus.DRAFT]},
    {
        key: 'STATIONARY_RECEIVED',
        label: 'Tiếp nhận',
        statuses: [EDocumentStatus.STATIONARY_RECEIVED],
    },
    {
        key: 'MANAGEMENT_REVIEWING',
        label: 'Đã duyệt',
        statuses: [EDocumentStatus.MANAGEMENT_REVIEWING],
    },
    {
        key: 'REGISTERED',
        label: 'Vào sổ',
        statuses: [EDocumentStatus.REGISTERED],
    },
    {key: 'ASSIGNED', label: 'Phân công', statuses: [EDocumentStatus.ASSIGNED]},
    {
        key: 'PROCESSING',
        label: 'Đang xử lý',
        statuses: [EDocumentStatus.PROCESSING],
    },
    {
        key: 'COMPLETED',
        label: 'Hoàn thành',
        statuses: [EDocumentStatus.COMPLETED],
    },
    {key: 'REJECTED', label: 'Từ chối', statuses: [EDocumentStatus.REJECTED]},
];

export const INCOMING_LEVEL_ALLOWED_STATUSES: Record<
    TLevelKey,
    EDocumentStatus[]
> = {
    LEADER: [
        EDocumentStatus.ASSIGNED,
        EDocumentStatus.PROCESSING,
        EDocumentStatus.COMPLETED,
    ],
    DEPARTMENT: [
        EDocumentStatus.ASSIGNED,
        EDocumentStatus.PROCESSING,
        EDocumentStatus.COMPLETED,
    ],
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

export const getLevelKey = (level?: EOrganization): TLevelKey =>
    level === EOrganization.STATIONARY
        ? 'STATIONARY'
        : level === EOrganization.MANAGEMENT
        ? 'MANAGEMENT'
        : level === EOrganization.DEPARTMENT
        ? 'DEPARTMENT'
        : 'LEADER';

export const mapIncomingStatusLabel = (status?: EDocumentStatus) =>
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

export const getIncomingCardAction = (
    status?: EDocumentStatus,
): TIncomingCardAction => {
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
    return {isEditable: false};
};

export const canDeleteIncomingByStatus = (status?: EDocumentStatus) =>
    status === EDocumentStatus.DRAFT || status === EDocumentStatus.REJECTED;

export const formatDateTime = (iso?: string) => {
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

export const formatDate = (iso?: string) => {
    if (!iso) return '--';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '--';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

export const todayIsoDate = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const normalizeDateInput = (value?: string) => {
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
        if (
            d.getFullYear() === yyyy &&
            d.getMonth() === mm - 1 &&
            d.getDate() === dd
        ) {
            return `${yyyyRaw}-${String(mm).padStart(2, '0')}-${String(
                dd,
            ).padStart(2, '0')}`;
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

export {formatFileSize} from '../../Document/utils/documentHelpers';

export const isObjectId = (value?: string) =>
    !!value && /^[a-fA-F0-9]{24}$/.test(value);

export const normalizePrimitive = (value: any) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value).trim();
    }
    return '';
};

export const normalizeCollection = (value: any): any[] => {
    if (value === null || value === undefined || value === '') return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && typeof parsed === 'object') return [parsed];
        } catch {}
        return trimmed
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }
    return [value];
};

export const getEntityId = (value: any) => {
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

export const getEntityName = (value: any) => {
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

export const normalizeObjectIdList = (value: any) => {
    const rawItems = normalizeCollection(value);
    return rawItems.map(getEntityId).filter(isObjectId);
};

export const joinEntityNames = (...values: any[]) => {
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

export const inferFormMode = (doc: any, isStationary: boolean): TFormMode => {
    if (!isStationary) return 'LAYOUT_4';
    const status = doc?.status as EDocumentStatus | undefined;
    if (status === EDocumentStatus.REGISTERED) {
        return 'LAYOUT_4';
    }
    if (status === EDocumentStatus.MANAGEMENT_REVIEWING) {
        return 'LAYOUT_3';
    }
    return 'LAYOUT_1';
};

export const buildCategoryPath = (
    leafId: string,
    byId: Record<string, any>,
) => {
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

export const buildCategoryById = (categoryList: any[]) =>
    categoryList.reduce((acc: Record<string, any>, category: any) => {
        if (category?._id) {
            acc[category._id] = category;
        }
        return acc;
    }, {});

export const buildOptionSearchText = (...values: Array<string | undefined>) =>
    values
        .map(value => String(value || '').trim())
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('vi');
