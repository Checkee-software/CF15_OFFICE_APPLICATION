import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IDocument} from '../shared-types/Response/DocumentResponse/DocumentResponse';
import ENV from '@/config/ENV';
import RNFS from 'react-native-fs';
import {encode} from 'base64-arraybuffer';

type DocumentListParams = {type?: string; page?: number; rows?: number};
type DocumentListWithTotal = {data: IDocument[]; total: number};
type DocumentDetailPayload = IDocument | {document?: IDocument | null; stepsInfo?: any[]};

const requestDocumentList = async (
    params?: DocumentListParams,
): Promise<DocumentListWithTotal> => {
    try {
        const type = params?.type || 'INCOMING';
        const queryParts = [`type=${encodeURIComponent(type)}`];
        const rows =
            typeof params?.rows === 'number' && Number.isFinite(params.rows)
                ? params.rows
                : 100;
        queryParts.push(`rows=${rows}`);
        if (typeof params?.page === 'number') {
            queryParts.push(`page=${params.page}`);
        }
        const response = await axiosClient.get(
            `${ENV.BACKEND_URL}/resources/documents/list?${queryParts.join('&')}`,
        );

        const payload = response.data?.data ?? response.data ?? {};
        const docsCandidate = payload?.data ?? payload?.documents ?? [];
        const docs = Array.isArray(docsCandidate) ? docsCandidate : [];
        const rawTotal =
            payload?.count ??
            payload?.total ??
            payload?.totalCount ??
            payload?.pagination?.total ??
            payload?.meta?.total;
        const totalParsed = Number(rawTotal);
        const total = Number.isFinite(totalParsed) ? totalParsed : docs.length;

        return {data: docs, total};
    } catch (error) {
        return {data: [], total: 0};
    }
};

interface DocumentStore {
    isLoading: boolean;
    listDocument: IDocument[];
    fetchDocumentListWithTotal: (params?: DocumentListParams) => Promise<DocumentListWithTotal>;
    fetchDocuments: (params?: DocumentListParams) => Promise<IDocument[]>;
    getListDocument: (params?: DocumentListParams) => Promise<void>;
    downloadFile: (fileName: string) => Promise<string | undefined>;
    createOutgoingDocument: (formData: FormData) => Promise<boolean>;
    createIncomingDocument: (formData: FormData) => Promise<boolean>;
    getDocumentDetail: (documentId: string) => Promise<DocumentDetailPayload | null>;
    updateOutgoingDocument: (documentId: string, formData: FormData) => Promise<boolean>;
    updateIncomingDraft: (documentId: string, formData: FormData) => Promise<boolean>;
    registerIncomingDocument: (documentId: string, formData: FormData) => Promise<boolean>;
    assignIncomingDocument: (documentId: string, formData: FormData) => Promise<boolean>;
    updateIncomingDocument: (documentId: string, formData?: FormData) => Promise<boolean>;
    deleteDocument: (documentId: string) => Promise<boolean>;
}

export const useDocumentStore = create<DocumentStore>(set => ({
    isLoading: false,
    listDocument: [],
    fetchDocumentListWithTotal: async (
        params,
    ): Promise<DocumentListWithTotal> => {
        return requestDocumentList(params);
    },
    fetchDocuments: async (params): Promise<IDocument[]> => {
        const {data} = await requestDocumentList(params);
        return data;
    },

    downloadFile: async (fileName: string) => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/downloads/${fileName}`,
                {
                    responseType: 'arraybuffer',
                },
            );
            const base64Data = encode(response.data);

            const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
            await RNFS.writeFile(filePath, base64Data, 'base64');

            Snackbar.show({
                text: 'Đã tải file thành công',
                duration: Snackbar.LENGTH_LONG,
            });

            return filePath;
        } catch (error) {
            console.error('Download failed:', error);
        }
    },

    getListDocument: async (params): Promise<void> => {
        set({isLoading: true});
        try {
            const {data: list} = await requestDocumentList(params);
            set({listDocument: list});
            set({isLoading: false});
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            setTimeout(() => {
                if (_error.response.status === 500) {
                    Snackbar.show({
                        text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    createOutgoingDocument: async formData => {
        set({isLoading: true});
        try {
            await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/documents/outgoing/create`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            Snackbar.show({
                text: 'Tạo văn bản đi thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể tạo văn bản đi, vui lòng thử lại!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },

    createIncomingDocument: async formData => {
        set({isLoading: true});
        try {
            await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/documents/incoming/create`,
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
            );
            Snackbar.show({
                text: 'Tạo văn bản đến thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể tạo văn bản đến, vui lòng thử lại!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },

    getDocumentDetail: async documentId => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/documents/detail/${documentId}`,
            );
            const payload = response.data?.data;
            return payload?.data ?? payload ?? null;
        } catch (error: any) {
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể tải chi tiết văn bản!',
                duration: Snackbar.LENGTH_LONG,
            });
            return null;
        }
    },

    updateOutgoingDocument: async (documentId, formData) => {
        set({isLoading: true});
        try {
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/documents/outgoing/update/${documentId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            Snackbar.show({
                text: 'Cập nhật văn bản đi thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể cập nhật văn bản đi, vui lòng thử lại!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },

    updateIncomingDraft: async (documentId, formData) => {
        set({isLoading: true});
        try {
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/documents/incoming-draft/update/${documentId}`,
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
            );
            Snackbar.show({
                text: 'Cập nhật bản nháp văn bản đến thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể cập nhật bản nháp văn bản đến!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },

    registerIncomingDocument: async (documentId, formData) => {
        set({isLoading: true});
        try {
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/documents/incoming/register/${documentId}`,
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
            );
            Snackbar.show({
                text: 'Vào sổ văn bản đến thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể vào sổ văn bản đến!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },

    assignIncomingDocument: async (documentId, formData) => {
        set({isLoading: true});
        try {
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/documents/incoming/assign/${documentId}`,
                formData,
                {headers: {'Content-Type': 'multipart/form-data'}},
            );
            Snackbar.show({
                text: 'Phân công văn bản đến thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể phân công văn bản đến!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },

    updateIncomingDocument: async (documentId, formData) => {
        set({isLoading: true});
        try {
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/documents/incoming/update/${documentId}`,
                formData || {},
                formData ? {headers: {'Content-Type': 'multipart/form-data'}} : undefined,
            );
            Snackbar.show({
                text: 'Cập nhật tiến trình văn bản đến thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể cập nhật tiến trình văn bản đến!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },

    deleteDocument: async documentId => {
        set({isLoading: true});
        try {
            await axiosClient.delete(
                `${ENV.BACKEND_URL}/resources/documents/${documentId}`,
            );
            Snackbar.show({
                text: 'Xóa văn bản thành công!',
                duration: Snackbar.LENGTH_LONG,
            });
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({isLoading: false});
            Snackbar.show({
                text:
                    error?.response?.data?.message ||
                    'Không thể xóa văn bản, vui lòng thử lại!',
                duration: Snackbar.LENGTH_LONG,
            });
            return false;
        }
    },
}));
