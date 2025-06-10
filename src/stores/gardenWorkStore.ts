import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IGardenData} from '@/shared-types/Response/GardenDataResponse/GardenDataResponse';
import {IRateReportHarvest} from '@/shared-types/form-data/HarvestHistoryFormData/HarvestHistoryFormData';

const backendURL = 'http://cf15dev.checkee.vn';

interface gardenWorkStore {
    isLoading: boolean;
    isLoadingCreate: boolean;
    listGardenWorkBrowse: IGardenData[];
    listGardenWorkBrowseFilter: IGardenData[];
    badgeGardenWorkUnBrowse: number;
    getRequestDataGarden: () => Promise<any>;
    createRateReportHarvest: (
        harvestReportId: string,
        formRateReport: IRateReportHarvest,
    ) => Promise<void | undefined>;
    filterByStatus: (status: string) => void;
    resetData: () => void;
    setBrowsed: (newList: any) => void;
    setBadgeUnBrowse: () => void;
}

export const useGardenWorkStore = create<gardenWorkStore>(set => ({
    isLoading: false,
    isLoadingCreate: false,
    badgeGardenWorkUnBrowse: 0,
    listGardenWorkBrowse: [],
    listGardenWorkBrowseFilter: [],

    getRequestDataGarden: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get<any>(
                `${backendURL}/resources/gardens/request-data`,
            );

            set({
                listGardenWorkBrowse: response.data?.data || [],
                listGardenWorkBrowseFilter:
                    response.data?.data.filter(
                        (item: {status: any}) => item.status === 'NONE',
                    ) || [],
                badgeGardenWorkUnBrowse:
                    response.data?.data.filter(
                        (item: {status: any}) => item.status === 'NONE',
                    ).length || 0,
            });

            set({isLoading: false});

            return response.data.data;
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            setTimeout(() => {
                if (_error?.response?.data) {
                    Snackbar.show({
                        text: _error.response.data,
                        duration: Snackbar.LENGTH_LONG,
                    });
                } else {
                    Snackbar.show({
                        text: 'Đã xảy ra lỗi, vui lòng thử lại!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    createRateReportHarvest: async (
        harvestReportId: string,
        formRateReport: IRateReportHarvest,
    ) => {
        set({isLoadingCreate: true});
        try {
            const response = await axiosClient.post(
                `${backendURL}/resources/gardens/harvest/rate-report/${harvestReportId}`,
                formRateReport,
            );

            if (response.data?.data) {
                setTimeout(() => {
                    if (response.data?.data) {
                        Snackbar.show({
                            text: `${response.data.message}`,
                            duration: Snackbar.LENGTH_LONG,
                        });
                    }
                }, 100);
            }

            set({isLoadingCreate: false});
            return response.data;
        } catch (error: any) {
            set({isLoadingCreate: false});

            const _error = error;

            console.log(_error);

            setTimeout(() => {
                if (_error?.response?.data) {
                    Snackbar.show({
                        text: _error.response.data,
                        duration: Snackbar.LENGTH_LONG,
                    });
                } else {
                    Snackbar.show({
                        text: 'Đã xảy ra lỗi, vui lòng thử lại!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    filterByStatus: status =>
        set(state => ({
            listGardenWorkBrowseFilter: state.listGardenWorkBrowse.filter(
                item => item.status === status,
            ),
        })),

    setBadgeUnBrowse: () =>
        set(state => ({
            badgeGardenWorkUnBrowse: state.listGardenWorkBrowse.filter(
                item => item.status === 'NONE',
            ).length,
        })),

    setBrowsed: (newList: any) =>
        set(() => ({
            listGardenWorkFilter: newList,
            listGardenWork: newList,
            badgeGardenWorkUnBrowse: newList.filter(
                (item: {status: string}) => item.status === 'NONE',
            ).length,
        })),

    resetData: () =>
        set(state => ({
            listGardenWorkBrowseFilter: state.listGardenWorkBrowse,
        })),
}));
