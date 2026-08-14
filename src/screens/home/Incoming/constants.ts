import { EDocumentStatus } from '@/shared-types/common/Document/document';
import type { TLevelKey, TTab } from './types';

export const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
    'Bản nháp': { bg: '#ECECEC', color: '#666666' },
    'Tiếp nhận': { bg: '#FFF0DD', color: '#F39C12' },
    'Đã duyệt': { bg: '#E5F8E8', color: '#4CAF50' },
    'Vào sổ': { bg: '#E8F7EA', color: '#66BB6A' },
    'Phân công': { bg: '#E3F0FF', color: '#42A5F5' },
    'Đang xử lý': { bg: '#E3F0FF', color: '#42A5F5' },
    'Hoàn thành': { bg: '#E9F8EC', color: '#81C784' },
    'Từ chối': { bg: '#FFEAEA', color: '#FF6B6B' },
};

export const INCOMING_ALL_TABS: TTab[] = [
    { key: 'DRAFT', label: 'Bản nháp', statuses: [EDocumentStatus.DRAFT] },
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
    {
        key: 'ASSIGNED',
        label: 'Phân công',
        statuses: [EDocumentStatus.ASSIGNED],
    },
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
    {
        key: 'REJECTED',
        label: 'Từ chối',
        statuses: [EDocumentStatus.REJECTED],
    },
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
