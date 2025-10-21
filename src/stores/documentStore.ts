import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IDocument} from '../shared-types/Response/DocumentResponse/DocumentResponse';
import ENV from '@/config/ENV';
import RNFS from 'react-native-fs';
import {encode} from 'base64-arraybuffer';
interface DocumentStore {
    isLoading: boolean;
    listDocument: IDocument[];
    getListDocument: () => Promise<void>;
    downloadFile: (fileName: string) => Promise<string | undefined>;
}

export const useDocumentStore = create<DocumentStore>(set => ({
    isLoading: false,
    listDocument: [],

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

    getListDocument: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/documents/collection`,
            );

            set({listDocument: response.data?.data || []});
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
}));
