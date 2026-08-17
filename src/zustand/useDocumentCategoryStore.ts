import { create } from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import DocumentCategoryResponse from '@/shared-types/Response/DocumentCategoryResponse';
import ENV from '@/config/ENV';

interface MixedContentItem extends DocumentCategoryResponse.IList {
  type: 'folder' | 'document';
  title?: string;
  registeredNumber?: string;
  status?: string;
  docType?: string;
  fileCount?: number;
}

type GetCategoryListOptions = {
  isFromNumbering?: boolean;
  includeDocumentCounts?: boolean;
};

const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INCOMING: 'Văn bản đến',
  OUTGOING: 'Văn bản đi',
};

const DOCUMENT_CATEGORY_TYPES = ['INCOMING', 'OUTGOING'] as const;
type DocumentCategoryDocumentType = (typeof DOCUMENT_CATEGORY_TYPES)[number];

const getDocumentTypeLabel = (value?: string) => {
  const normalized = String(value || '').toUpperCase();
  return DOCUMENT_TYPE_LABEL[normalized] || value || 'Văn bản';
};

const pickArrayPayload = (payload: any): any[] => {
  const candidates = [
    payload?.data?.data,
    payload?.data?.documents,
    payload?.data,
    payload?.documents,
    payload,
  ];

  const matched = candidates.find(Array.isArray);
  return matched || [];
};

const pickCountPayload = (payload: any, fallbackCount: number) => {
  const candidates = [
    payload?.data?.count,
    payload?.data?.total,
    payload?.data?.totalCount,
    payload?.count,
    payload?.total,
    payload?.totalCount,
  ];
  const matched = candidates
    .map(value => Number(value))
    .find(value => Number.isFinite(value));

  return matched ?? fallbackCount;
};

const getFileCount = (item: any) => {
  const fieldCount = [
    item?.signedFilesCount,
    item?.mainFilesCount,
    item?.attachedFilesCount,
    item?.approvedFilesCount,
  ].reduce((total, value) => {
    const parsed = Number(value);
    return total + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
  if (fieldCount > 0) {
    return fieldCount;
  }

  const arrayCount = [
    item?.signedFiles,
    item?.mainFiles,
    item?.attachedFiles,
    item?.approvedFiles,
    item?.files,
  ].reduce((total, files) => total + (Array.isArray(files) ? files.length : 0), 0);
  if (arrayCount > 0) {
    return arrayCount;
  }

  const explicitCount = Number(item?.fileCount ?? item?.filesCount);
  if (Number.isFinite(explicitCount)) {
    return explicitCount;
  }

  return 0;
};

const normalizeMixedContentItem = (
  item: any,
  fallbackType?: 'folder' | 'document',
): MixedContentItem | null => {
  if (!item?._id) {
    return null;
  }

  const rawType = item.type;
  const isExplicitMixedType = rawType === 'folder' || rawType === 'document';
  const isDocumentLike =
    fallbackType === 'document' ||
    (!isExplicitMixedType &&
      (!!item.title ||
        !!item.registeredNumber ||
        !!item.status ||
        !!item.destinationCategoryId ||
        Array.isArray(item.mainFiles) ||
        Array.isArray(item.signedFiles)));
  const type = isExplicitMixedType ? rawType : isDocumentLike ? 'document' : 'folder';

  if (type === 'document') {
    const fileCount = getFileCount(item);
    const rawDocType = item.docType || item.documentType || item.type;
    const docTypeLabel = getDocumentTypeLabel(rawDocType);
    return {
      ...item,
      _id: String(item._id),
      type,
      name: item.name || item.title || item.registeredNumber || 'Tài liệu',
      code: item.code || item.registeredNumber || '',
      format: getDocumentTypeLabel(item.format || rawDocType),
      docType: docTypeLabel,
      documentCount: item.documentCount ?? fileCount,
      fileCount,
    } as MixedContentItem;
  }

  return {
    ...item,
    _id: String(item._id),
    type,
    name: item.name || item.title || 'Thư mục',
    code: item.code || '',
  } as MixedContentItem;
};

const mergeMixedContent = (...groups: Array<Array<any>>) => {
  const merged = new Map<string, MixedContentItem>();

  groups.flat().forEach(item => {
    const normalized = normalizeMixedContentItem(item);
    if (!normalized) {
      return;
    }

    const key = `${normalized.type}_${normalized._id}`;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, ...normalized } : normalized);
  });

  return Array.from(merged.values());
};

const requestDocumentsByCategory = async (
  categoryId: string,
  search?: string,
  documentType?: DocumentCategoryDocumentType,
) => {
  const params: Record<string, string> = { rows: '1000' };
  if (search) {
    params.search = search;
  }
  if (documentType) {
    params.type = documentType;
  }

  const response = await axiosClient.get(
    `${ENV.BACKEND_URL}/resources/documents/category/${categoryId}`,
    { params },
  );
  const documents = pickArrayPayload(response.data);

  return {
    documents,
    count: pickCountPayload(response.data, documents.length),
    documentType,
  };
};

const getDocumentsByCategory = async (categoryId: string, search?: string) => {
  const results = await Promise.allSettled([
    requestDocumentsByCategory(categoryId, search),
    ...DOCUMENT_CATEGORY_TYPES.map(type =>
      requestDocumentsByCategory(categoryId, search, type),
    ),
  ]);
  const fulfilledResults = results
    .filter(
      (result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof requestDocumentsByCategory>>> =>
        result.status === 'fulfilled',
    )
    .map(result => result.value);

  if (fulfilledResults.length === 0) {
    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    throw rejected?.reason || new Error('Cannot fetch category documents');
  }

  const merged = new Map<string, any>();
  fulfilledResults.forEach(result => {
    result.documents.forEach((document, index) => {
      const key = String(
        document?._id ||
          document?.id ||
          `${document?.registeredNumber || 'document'}_${index}_${merged.size}`,
      );
      merged.set(key, document);
    });
  });

  const typedResults = fulfilledResults.filter(result => result.documentType);
  const typedDocumentKeys = typedResults.flatMap(result =>
    result.documents
      .map(document => String(document?._id || document?.id || ''))
      .filter(Boolean),
  );
  const typedUniqueKeyCount = new Set(typedDocumentKeys).size;
  const typedResultsCoverBothTypes = DOCUMENT_CATEGORY_TYPES.every(type =>
    typedResults.some(result => result.documentType === type),
  );
  const typedResultsHaveOverlap =
    typedDocumentKeys.length > 0 && typedUniqueKeyCount < typedDocumentKeys.length;
  const typedCount = typedResults.reduce((total, result) => total + result.count, 0);
  const documents = Array.from(merged.values());
  const count =
    typedResultsCoverBothTypes && !typedResultsHaveOverlap
      ? Math.max(typedCount, documents.length)
      : documents.length;

  return {
    documents,
    count,
  };
};

const enrichFolderDocumentCounts = async <T extends MixedContentItem>(
  items: T[],
): Promise<T[]> => {
  const folders = items.filter(item => item.type === 'folder');
  if (folders.length === 0) {
    return items;
  }

  const countResults = await Promise.allSettled(
    folders.map(async folder => ({
      id: folder._id,
      count: (await getDocumentsByCategory(folder._id)).count,
    })),
  );
  const countById = new Map<string, number>();
  countResults.forEach(result => {
    if (result.status === 'fulfilled') {
      countById.set(result.value.id, result.value.count);
    }
  });

  return items.map(item =>
    item.type === 'folder' && countById.has(item._id)
      ? { ...item, documentCount: countById.get(item._id) || 0 }
      : item,
  );
};

interface DocumentCategoryStore {
  isLoading: boolean;
  categories: DocumentCategoryResponse.IList[];
  mixedContent: MixedContentItem[];
  currentCategoryId: string | null;
  breadcrumb: Array<{ id: string; name: string }>;

  // Fetch operations
  getCategoryList: (search?: string, options?: GetCategoryListOptions) => Promise<void>;
  getMixedContent: (categoryId: string, search?: string) => Promise<void>;
  getCategoryDetail: (categoryId: string) => Promise<DocumentCategoryResponse.IList | null>;

  // Delete operations
  deleteCategory: (categoryId: string) => Promise<boolean>;
  deleteDocument: (documentId: string) => Promise<boolean>;

  // State management
  setBreadcrumb: (breadcrumb: Array<{ id: string; name: string }>) => void;
  setCurrentCategoryId: (categoryId: string | null) => void;
  reset: () => void;
}

export const useDocumentCategoryStore = create<DocumentCategoryStore>((set, get) => ({
  isLoading: false,
  categories: [],
  mixedContent: [],
  currentCategoryId: null,
  breadcrumb: [],

  getCategoryList: async (search?: string, options?: GetCategoryListOptions) => {
    set({ isLoading: true });
    try {
      const params: any = { isGetAll: true };
      if (options?.isFromNumbering) {
        delete params.isGetAll;
        params.isFromNumbering = true;
      }
      if (search) {
        params.search = search;
      }
      const response = await axiosClient.get(
        `${ENV.BACKEND_URL}/resources/document-categories/`,
        { params },
      );

      const data = pickArrayPayload(response.data);
      // Mark all as folders since this is category list
      const categoriesWithType = data.map((item: DocumentCategoryResponse.IList) => ({
        ...item,
        name: item.name || 'Thư mục',
        type: 'folder' as const,
      })) as MixedContentItem[];
      const categoriesWithCounts = options?.includeDocumentCounts
        ? await enrichFolderDocumentCounts(categoriesWithType)
        : categoriesWithType;

      set({ categories: categoriesWithCounts, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Error fetching categories:', error);
      Snackbar.show({
        text: 'Lỗi khi tải danh sách thư mục',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  },

  getMixedContent: async (categoryId: string, search?: string) => {
    set({ isLoading: true, currentCategoryId: categoryId });
    try {
      const params: Record<string, string> = {};
      if (search) {
        params.search = search;
      }

      const [mixedResult, documentsResult] = await Promise.allSettled([
        axiosClient.get(
          `${ENV.BACKEND_URL}/resources/document-categories/mixed-content/${categoryId}`,
          { params },
        ),
        getDocumentsByCategory(categoryId, search),
      ]);

      if (mixedResult.status === 'rejected' && documentsResult.status === 'rejected') {
        throw mixedResult.reason || documentsResult.reason;
      }

      const mixedData =
        mixedResult.status === 'fulfilled' ? pickArrayPayload(mixedResult.value.data) : [];
      const documentData =
        documentsResult.status === 'fulfilled'
          ? documentsResult.value.documents
              .map(item => normalizeMixedContentItem(item, 'document'))
              .filter(Boolean)
          : [];
      const mixedContent = await enrichFolderDocumentCounts(
        mergeMixedContent(mixedData, documentData),
      );

      set({
        mixedContent,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Error fetching mixed content:', error);
      Snackbar.show({
        text: 'Lỗi khi tải nội dung thư mục',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  },

  getCategoryDetail: async (categoryId: string) => {
    try {
      const response = await axiosClient.get(
        `${ENV.BACKEND_URL}/resources/document/category/${categoryId}`,
      );
      return response.data?.data || null;
    } catch (error: any) {
      console.error('Error fetching category detail:', error);
      return null;
    }
  },

  deleteCategory: async (categoryId: string) => {
    try {
      const response = await axiosClient.delete(
        `${ENV.BACKEND_URL}/resources/document-categories/${categoryId}`,
      );

      if (response.data?.success || response.status === 200) {
        Snackbar.show({
          text: 'Xóa thư mục thành công',
          duration: Snackbar.LENGTH_SHORT,
        });

        // Refresh current view
        const currentId = get().currentCategoryId;
        if (currentId) {
          get().getMixedContent(currentId);
        } else {
          get().getCategoryList();
        }

        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      Snackbar.show({
        text: 'Lỗi khi xóa thư mục',
        duration: Snackbar.LENGTH_SHORT,
      });
      return false;
    }
  },

  deleteDocument: async (documentId: string) => {
    try {
      const response = await axiosClient.delete(
        `${ENV.BACKEND_URL}/resources/document/${documentId}`,
      );

      if (response.data?.success || response.status === 200) {
        Snackbar.show({
          text: 'Xóa văn bản thành công',
          duration: Snackbar.LENGTH_SHORT,
        });

        // Refresh current view
        const currentId = get().currentCategoryId;
        if (currentId) {
          get().getMixedContent(currentId);
        }

        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      Snackbar.show({
        text: 'Lỗi khi xóa văn bản',
        duration: Snackbar.LENGTH_SHORT,
      });
      return false;
    }
  },

  setBreadcrumb: (breadcrumb) => {
    set({ breadcrumb });
  },

  setCurrentCategoryId: (categoryId) => {
    set({ currentCategoryId: categoryId });
  },

  reset: () => {
    set({
      isLoading: false,
      categories: [],
      mixedContent: [],
      currentCategoryId: null,
      breadcrumb: [],
    });
  },
}));
