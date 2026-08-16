import {create} from "zustand";
import axiosClient from "../utils/axiosClient";
import Snackbar from "react-native-snackbar";
import ENV from "@/config/ENV";
import {IRecord} from "@/shared-types/Response/RecordResponse/RecordResponse";

interface HistoryRecordsStore {
    isLoading: boolean;
    listHistoryRecords: IRecord[];
    getListHistoryRecord: () => Promise<void>;
}

export const useHistoryRecordsStore = create<HistoryRecordsStore>(set => ({
    isLoading: false,
    listHistoryRecords: [],

    getListHistoryRecord: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/records/collection`,
            );

            set({listHistoryRecords: response.data?.data || []});
            set({isLoading: false});
        } catch (error: any) {
            set({isLoading: false});

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
