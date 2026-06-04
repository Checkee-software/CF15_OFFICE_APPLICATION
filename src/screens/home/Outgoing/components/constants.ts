import type { TLevelKey } from '../types';

export {
  DOCUMENT_PRIORITY_LABEL,
  EDocumentPriority,
  EDocumentStatus,
  ESignDepartment,
  SIGN_DEPARTMENT_LABEL,
} from '@/shared-types/common/Document/document';

export const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  'Bản nháp': { bg: '#ECECEC', color: '#666666' },
  'Gửi duyệt': { bg: '#FFF0DD', color: '#F39C12' },
  'TP duyệt': { bg: '#E5F8E8', color: '#4CAF50' },
  'VT kiểm tra': { bg: '#FFF5DF', color: '#FFB300' },
  'Phê duyệt': { bg: '#E8F7EA', color: '#37a03d' },
  'Phát hành': { bg: '#E3F0FF', color: '#42A5F5' },
  'Lưu trữ': { bg: '#E9F8EC', color: '#81C784' },
  'Từ chối': { bg: '#FFEAEA', color: '#FF6B6B' },
};

export const OUTGOING_FILTER_ALL = 'Tất cả';
export const OUTGOING_FILTERS = [OUTGOING_FILTER_ALL, 'Bản nháp', 'Gửi duyệt', 'TP duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'];

export const OUTGOING_ALL_STATUSES_BY_LEVEL: Record<TLevelKey, string[]> = {
  CBNV: ['Bản nháp', 'Gửi duyệt', 'TP duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
  PHONG_BAN: ['Bản nháp', 'Gửi duyệt', 'TP duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
  VAN_THU: ['Gửi duyệt', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
  BAN_GIAM_DOC: ['Gửi duyệt', 'VT kiểm tra', 'Phê duyệt', 'Phát hành', 'Lưu trữ', 'Từ chối'],
};

export const OUTGOING_STATUS_DISPLAY: Record<string, string> = {
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


export const OUTGOING_ALL_FILTERS = OUTGOING_FILTERS;
