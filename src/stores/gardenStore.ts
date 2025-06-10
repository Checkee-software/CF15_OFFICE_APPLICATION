import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IGarden} from '@/shared-types/Response/GardenResponse/GardenResponse';
import {
    THarvestHistory,
    TCollection,
    IHavestHistory,
} from '@/shared-types/Response/HarvestHistoryResponse/HarvestHistoryResponse';

type GardenState = {
    gardens: IGarden | null;
    selectedGarden: IGarden | null;
    isLoading: boolean;
    fetchGardens: () => Promise<void>;
    fetchGardenDetail: (id: string) => Promise<void>;
    searchGardens: (id: string) => Promise<void>;
    postHarvestStatus: (
        _id: string,
        status: '0' | '1',
        harvestId?: string,
    ) => Promise<void>;
    postHarvestReport: (_id: string, amount: number) => Promise<void>;
    harvestHistory: IHavestHistory[];
    
    fetchHarvestHistory: (_id: string) => Promise<void>;
    fetchHarvestCollection: (_id: string) => Promise<void>;
};

const backendURL = 'http://cf15dev.checkee.vn';

const useGardenStore = create<GardenState>(set => ({
    gardens: null,
    selectedGarden: null,
    isLoading: false,
    harvestHistory: [],

    fetchGardens: async () => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${backendURL}/resources/gardens/collection`,
            );
            set({gardens: res.data?.data || []});
        } catch (error: any) {
            console.log(
                'FETCH_GARDENS_ERROR:',
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: 'Không thể tải danh sách khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchGardenDetail: async (id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${backendURL}/resources/gardens/detail/${id}`,
            );
            set({selectedGarden: res.data?.data || null});
        } catch (error: any) {
            console.log(
                'FETCH_GARDEN_DETAIL_ERROR:',
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: 'Không thể tải chi tiết khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    searchGardens: async (code: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${backendURL}/resources/gardens/find?code=${code}`,
            );
            set({gardens: res.data?.data || null});
        } catch (error: any) {
            console.log(
                'SEARCH_GARDENS_ERROR:',
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: 'Không thể tìm thấy khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
            set({gardens: null});
        } finally {
            set({isLoading: false});
        }
    },

    postHarvestStatus: async (
        _id: string,
        status: '0' | '1',
        harvestId?: string,
    ) => {
        set({isLoading: true});
        try {
            let url = `${backendURL}/resources/gardens/harvest?_id=${_id}&status=${status}`;
            if (status === '0' && harvestId) {
                url += `&harvestId=${harvestId}`;
            }
            const res = await axiosClient.post(url);

            Snackbar.show({
                text: 'Cập nhật trạng thái thu hoạch thành công',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            console.log(
                'POST_HARVEST_STATUS_ERROR:',
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: 'Không thể cập nhật trạng thái thu hoạch',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    postHarvestReport: async (_id: string, amount: number) => {
        set({isLoading: true});
        try {
            const url = `${backendURL}/resources/gardens/harvest/report/${_id}/${amount}`;
            const res = await axiosClient.post(url);

            Snackbar.show({
                text: 'Báo cáo thu hoạch thành công',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            console.log(
                'POST_HARVEST_REPORT_ERROR:',
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: 'Không thể báo cáo thu hoạch',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchHarvestHistory: async (_id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get<THarvestHistory>(
                `${backendURL}/resources/gardens/harvest/history?_id=${_id}`,
            );
            set({harvestHistory: res.data?.data || []});
        } catch (error: any) {
            console.log(
                'FETCH_HARVEST_HISTORY_ERROR:',
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: 'Không thể tải lịch sử thu hoạch',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchHarvestCollection: async (_id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get<TCollection>(
                `${backendURL}/resources/gardens/harvest/collection?_id=${_id}`,
            );
            set({harvestHistory: res.data?.data || []});
        } catch (error: any) {
            console.log(
                'FETCH_HARVEST_HISTORY_ERROR:',
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: 'Không thể tải lịch sử thu hoạch',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },
}));

export default useGardenStore;
