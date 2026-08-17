export type AttachedFiles = {
    originalname: string;
    path: string;
    size: number;
    filename?: string;
    source?: string;
    group?: 'main' | 'attached';
    signStatus?: string;
    managerInitialedAt?: string | null;
    managerSignedAt?: string | null;
    directorInitialedAt?: string | null;
    directorApprovedAt?: string | null;
};

export type TApproveActionMode =
    | 'AUTO'
    | 'DEPARTMENT_INITIAL'
    | 'DEPARTMENT_APPROVE'
    | 'MANAGEMENT_INITIAL'
    | 'MANAGEMENT_SIGN'
    | 'MANAGEMENT_FINAL'
    | 'STATIONARY_SUBMIT'
    | 'STATIONARY_PUBLISH'
    | 'STATIONARY_ARCHIVE';

export const MYSIGN_POLL_INTERVAL_MS = 2500;
export const MYSIGN_POLL_MAX_ATTEMPTS = 24;

export const OUTGOING_DETAIL_STATUS_DISPLAY: Record<string, string> = {
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
