import { getStatusLabel } from '@/shared-types/common/Document/document';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';
import { OUTGOING_STATUS_DISPLAY } from '../components/constants';
import type { TExistingFile, TLevelKey } from '../types';

export const getSafeBaseName = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) { return ''; }
  const noQuery = raw.split('?')[0].split('#')[0];
  const slashParts = noQuery.split('/');
  const lastSlashPart = slashParts[slashParts.length - 1] || '';
  const backslashParts = lastSlashPart.split('\\');
  return backslashParts[backslashParts.length - 1] || lastSlashPart;
};

export const normalizeDisplayName = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) { return ''; }
  if (raw.includes('/') || raw.includes('\\')) {
    return getSafeBaseName(raw);
  }
  return raw;
};

export const normalizeExistingFile = (
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

export const asArray = (value: any): any[] => {
  if (Array.isArray(value)) { return value; }
  if (value === null || value === undefined) { return []; }
  if (typeof value === 'string') { return [{ path: value }]; }
  if (typeof value === 'object') { return [value]; }
  return [];
};

export const pickByType = (files: any[], typeCodes: string[]) =>
  files.filter((f: any) => typeCodes.includes(String(f?.type || f?.fileType || f?.file?.type || f?.file?.fileType || '').toUpperCase()));

export const dedupeExistingFiles = (files: TExistingFile[]) => {
  const seen = new Set<string>();
  return files.filter(file => {
    const key = `${file.filename || ''}|${file.originalname || ''}|${file.fileKey || ''}`;
    if (seen.has(key)) { return false; }
    seen.add(key);
    return true;
  });
};

export const isObjectIdLike = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

export const resolveCreatorDepartmentCode = (userInfo: any) => {
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

export const applyDepartmentCodeToRegisteredFormat = (format: string, departmentCode: string) => {
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

export const getOutgoingStatusDisplay = (status: unknown, level: TLevelKey) => {
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

export const getLevelKey = (level?: EOrganization): TLevelKey => {
  if (level === EOrganization.DEPARTMENT) { return 'PHONG_BAN'; }
  // Business rule: LEADER uses CBNV outgoing flow.
  if (level === EOrganization.LEADER) { return 'CBNV'; }
  if (level === EOrganization.STATIONARY) { return 'VAN_THU'; }
  if (level === EOrganization.MANAGEMENT) { return 'BAN_GIAM_DOC'; }
  return 'CBNV';
};
