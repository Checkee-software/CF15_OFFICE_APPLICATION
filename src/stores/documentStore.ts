import { create } from "zustand";
import axiosClient from "../utils/axiosClient";
import Snackbar from "react-native-snackbar";
import { IDocument } from "../shared-types/Response/DocumentResponse/DocumentResponse";
import ENV from "@/config/ENV";

interface DocumentStore {
    isLoading: boolean;
    listDocument: IDocument[];
    getListDocument: () => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
    isLoading: false,
    listDocument: [],

    getListDocument: async () => {
        set({ isLoading: true });
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/documents/collection`,
            );

            set({ listDocument: response.data?.data || [] });
            set({ isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });

            const _error = error;

            setTimeout(() => {
                if (_error.response.status === 500) {
                    Snackbar.show({
                        text: "Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!",
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },
}));
