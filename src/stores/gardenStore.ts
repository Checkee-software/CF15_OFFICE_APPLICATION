import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IGarden} from '@/shared-types/Response/GardenResponse/GardenResponse';

type GardenState = {
    gardens: IGarden[];
    selectedGarden: IGarden | null;
    isLoading: boolean;
    fetchGardens: () => Promise<void>;
    fetchGardenDetail: (id: string) => Promise<void>;
};

const backendURL = 'http://cf15officeservice.checkee.vn';

const useGardenStore = create<GardenState>(set => ({
    gardens: [],
    selectedGarden: null,
    isLoading: false,

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
}));

export default useGardenStore;
