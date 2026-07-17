import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '@/utils/axiosClient';
import ENV from '@/config/ENV';
import {
  type TDirectoryUser,
  type TDepartmentOption,
  type TIncomingAssignmentDraft,
} from './index';

export const INCOMING_ASSIGNMENT_DRAFT_STORAGE_KEY = '@incomingAssignmentDrafts';
const ASSIGNMENT_OPTIONS_CACHE_TTL_MS = 5 * 60 * 1000;

export type TAssignmentOptionsSnapshot = {
  users: TDirectoryUser[];
  departments: TDepartmentOption[];
  fetchedAt: number;
};

let incomingAssignmentOptionsCache: TAssignmentOptionsSnapshot | null = null;
let incomingAssignmentOptionsPromise: Promise<TAssignmentOptionsSnapshot> | null = null;

const normalizeSelectionList = (payload: any) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const buildOptionSearchText = (...values: Array<string | undefined>) =>
  values
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('vi');

const mapDirectoryUsers = (users: any[]): TDirectoryUser[] =>
  users
    .map((user: any) => ({
      _id: String(user?._id || user?.id || user?.value || ''),
      fullName: String(user?.fullName || user?.name || user?.label || ''),
      departmentId: String(user?.userType?.department || user?.departmentId || ''),
      departmentName: String(user?.departmentName || user?.department?.name || ''),
    }))
    .filter((user: TDirectoryUser) => !!user._id && !!user.fullName)
    .sort((a: TDirectoryUser, b: TDirectoryUser) => a.fullName.localeCompare(b.fullName, 'vi'));

const mapDepartmentOptions = (departments: any[]): TDepartmentOption[] =>
  departments
    .map((dep: any) => ({
      id: String(dep?._id || dep?.id || dep?.value || ''),
      name: String(dep?.name || dep?.departmentName || dep?.label || ''),
      code: String(dep?.code || dep?.departmentCode || '').trim(),
    }))
    .filter((dep: TDepartmentOption) => !!dep.id && !!dep.name)
    .sort((a: TDepartmentOption, b: TDepartmentOption) => a.name.localeCompare(b.name, 'vi'));

const buildDepartmentFallbackFromUsers = (users: TDirectoryUser[]): TDepartmentOption[] => {
  const depMap = new Map<string, string>();
  users.forEach(user => {
    if (!user.departmentId) return;
    if (!depMap.has(user.departmentId)) {
      depMap.set(user.departmentId, user.departmentName || user.departmentId);
    }
  });
  return Array.from(depMap.entries())
    .map(([id, name]) => ({
      id,
      name,
      code: id,
    }))
    .sort((a: TDepartmentOption, b: TDepartmentOption) => a.name.localeCompare(b.name, 'vi'));
};

const isFreshAssignmentOptionsCache = () =>
  !!incomingAssignmentOptionsCache &&
  Date.now() - incomingAssignmentOptionsCache.fetchedAt < ASSIGNMENT_OPTIONS_CACHE_TTL_MS;

export const loadIncomingAssignmentOptions = async (): Promise<TAssignmentOptionsSnapshot> => {
  if (isFreshAssignmentOptionsCache() && incomingAssignmentOptionsCache) {
    return incomingAssignmentOptionsCache;
  }

  if (incomingAssignmentOptionsPromise) {
    return incomingAssignmentOptionsPromise;
  }

  incomingAssignmentOptionsPromise = (async () => {
    const [usersResult, departmentsResult] = await Promise.allSettled([
      axiosClient.get(`${ENV.BACKEND_URL}/resources/users/selection`),
      axiosClient.get(`${ENV.BACKEND_URL}/resources/departments/selection`),
    ]);

    const users = usersResult.status === 'fulfilled'
      ? mapDirectoryUsers(normalizeSelectionList(usersResult.value?.data))
      : [];
    const departmentsFromApi = departmentsResult.status === 'fulfilled'
      ? mapDepartmentOptions(normalizeSelectionList(departmentsResult.value?.data))
      : [];
    const departments = departmentsFromApi.length > 0
      ? departmentsFromApi
      : buildDepartmentFallbackFromUsers(users);
    const hasSuccessfulSource =
      usersResult.status === 'fulfilled' || departmentsResult.status === 'fulfilled';

    if (users.length === 0 && departments.length === 0 && incomingAssignmentOptionsCache) {
      return incomingAssignmentOptionsCache;
    }
    if (users.length === 0 && departments.length === 0 && !hasSuccessfulSource) {
      throw new Error('Cannot load incoming assignment options');
    }

    const snapshot = {
      users,
      departments,
      fetchedAt: Date.now(),
    };
    incomingAssignmentOptionsCache = snapshot;
    return snapshot;
  })().finally(() => {
    incomingAssignmentOptionsPromise = null;
  });

  return incomingAssignmentOptionsPromise;
};

export const getAssignmentOptionsCache = () => incomingAssignmentOptionsCache;

export const readStoredAssignmentDrafts = async (): Promise<Record<string, TIncomingAssignmentDraft>> => {
  try {
    const raw = await AsyncStorage.getItem(INCOMING_ASSIGNMENT_DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getStoredAssignmentDraft = async (documentId: string) => {
  const drafts = await readStoredAssignmentDrafts();
  return drafts[documentId];
};

export const saveStoredAssignmentDraft = async (
  documentId: string,
  draft: TIncomingAssignmentDraft,
) => {
  const drafts = await readStoredAssignmentDrafts();
  drafts[documentId] = draft;
  await AsyncStorage.setItem(
    INCOMING_ASSIGNMENT_DRAFT_STORAGE_KEY,
    JSON.stringify(drafts),
  );
};

export const removeStoredAssignmentDraft = async (documentId: string) => {
  const drafts = await readStoredAssignmentDrafts();
  if (!drafts[documentId]) {
    return;
  }
  delete drafts[documentId];
  await AsyncStorage.setItem(
    INCOMING_ASSIGNMENT_DRAFT_STORAGE_KEY,
    JSON.stringify(drafts),
  );
};
