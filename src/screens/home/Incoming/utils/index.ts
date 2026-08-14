/**
 * Incoming utility functions.
 * Pure functions only – no React state or API calls.
 * Types are in ./types.ts, constants are in ./constants.ts
 */
import { EDocumentStatus } from '@/shared-types/common/Document/document';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';

// Re-export types so existing imports like `import { ... } from '../utils'` still work
export type {
    TLevelKey,
    TTab,
    TPickedFile,
    TExistingFileSource,
    TExistingFile,
    TIncomingItem,
    TFormMode,
    TIncomingCardAction,
    TDirectoryUser,
    TDepartmentOption,
    TDropdownListOption,
    TIncomingAssignmentDraft,
    TFocusableIncomingField,
} from '../types';

// Re-export constants
export {
    STATUS_COLOR,
    INCOMING_ALL_TABS,
    INCOMING_LEVEL_ALLOWED_STATUSES,
} from '../constants';

// Re-export shared file helpers to maintain backward-compat imports
export {
    getSafeBaseName,
    normalizeDisplayName,
    normalizeExistingFile,
    dedupeExistingFiles,
} from '../../shared/utils/fileHelpers';

export { formatFileSize } from '../../Document/utils/documentHelpers';

// ---------------------------------------------------------------------------
// Level / status helpers
// ---------------------------------------------------------------------------

export const getLevelKey = (level?: EOrganization) =>
    level === EOrganization.STATIONARY
        ? ('STATIONARY' as const)
        : level === EOrganization.MANAGEMENT
        ? ('MANAGEMENT' as const)
        : level === EOrganization.DEPARTMENT
        ? ('DEPARTMENT' as const)
        : ('LEADER' as const);

export const mapIncomingStatusLabel = (status?: EDocumentStatus): string =>
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

import type { TIncomingCardAction, TFormMode } from '../types';

export const getIncomingCardAction = (
    status?: EDocumentStatus,
): TIncomingCardAction => {
    if (status === EDocumentStatus.MANAGEMENT_REVIEWING) {
        return { isEditable: true, forcedMode: 'LAYOUT_3', nextActionLabel: 'Vào sổ' };
    }
    if (status === EDocumentStatus.REGISTERED) {
        return { isEditable: true, forcedMode: 'LAYOUT_4', nextActionLabel: 'Phân công' };
    }
    if (
        status === EDocumentStatus.DRAFT ||
        status === EDocumentStatus.REJECTED
    ) {
        return { isEditable: true, forcedMode: 'LAYOUT_1', nextActionLabel: 'Cập nhật' };
    }
    return { isEditable: false };
};

export const canDeleteIncomingByStatus = (status?: EDocumentStatus): boolean =>
    status === EDocumentStatus.DRAFT || status === EDocumentStatus.REJECTED;

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

export const formatDateTime = (iso?: string): string => {
    if (!iso) { return '--'; }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) { return '--'; }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi} ${dd}/${mm}/${yyyy}`;
};

export const formatDate = (iso?: string): string => {
    if (!iso) { return '--'; }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) { return '--'; }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

export const todayIsoDate = (): string => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const normalizeDateInput = (value?: string): string => {
    const raw = String(value || '').trim();
    if (!raw) { return ''; }
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
            return `${yyyyRaw}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
        return '';
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) { return ''; }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// ---------------------------------------------------------------------------
// ObjectId / Entity helpers
// ---------------------------------------------------------------------------

export const isObjectId = (value?: string): boolean =>
    !!value && /^[a-fA-F0-9]{24}$/.test(value);

export const normalizePrimitive = (value: any): string => {
    if (value === null || value === undefined) { return ''; }
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value).trim();
    }
    return '';
};

export const normalizeCollection = (value: any): any[] => {
    if (value === null || value === undefined || value === '') { return []; }
    if (Array.isArray(value)) { return value; }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) { return []; }
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) { return parsed; }
            if (parsed && typeof parsed === 'object') { return [parsed]; }
        } catch { /* empty */ }
        return trimmed.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [value];
};

export const getEntityId = (value: any): string => {
    const primitive = normalizePrimitive(value);
    if (primitive) { return primitive; }
    if (!value || typeof value !== 'object') { return ''; }
    return String(
        value._id || value.id || value.value ||
        value.userId || value.departmentId ||
        value.user?._id || value.department?._id || '',
    ).trim();
};

export const getEntityName = (value: any): string => {
    const primitive = normalizePrimitive(value);
    if (primitive) { return isObjectId(primitive) ? '' : primitive; }
    if (!value || typeof value !== 'object') { return ''; }
    return String(
        value.fullName || value.name || value.departmentName ||
        value.label || value.title ||
        value.user?.fullName || value.user?.name ||
        value.department?.name || '',
    ).trim();
};

export const normalizeObjectIdList = (value: any): string[] => {
    const rawItems = normalizeCollection(value);
    return rawItems.map(getEntityId).filter(isObjectId);
};

export const joinEntityNames = (...values: any[]): string => {
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

// ---------------------------------------------------------------------------
// Form mode / category helpers
// ---------------------------------------------------------------------------

export const inferFormMode = (doc: any, isStationary: boolean): TFormMode => {
    if (!isStationary) { return 'LAYOUT_4'; }
    const status = doc?.status as EDocumentStatus | undefined;
    if (status === EDocumentStatus.REGISTERED) { return 'LAYOUT_4'; }
    if (status === EDocumentStatus.MANAGEMENT_REVIEWING) { return 'LAYOUT_3'; }
    return 'LAYOUT_1';
};

export const buildCategoryPath = (
    leafId: string,
    byId: Record<string, any>,
): string[] => {
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

export const buildCategoryById = (categoryList: any[]): Record<string, any> =>
    categoryList.reduce((acc: Record<string, any>, category: any) => {
        if (category?._id) {
            acc[category._id] = category;
        }
        return acc;
    }, {});

export const buildOptionSearchText = (
    ...values: Array<string | undefined>
): string =>
    values
        .map(value => String(value || '').trim())
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('vi');
