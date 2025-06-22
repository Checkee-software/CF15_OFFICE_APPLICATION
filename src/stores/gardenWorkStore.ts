import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IGardenData} from '@/shared-types/Response/GardenDataResponse/GardenDataResponse';
import {IRateReportHarvest} from '@/shared-types/form-data/HarvestHistoryFormData/HarvestHistoryFormData';
import {EStatus} from '@/shared-types/Response/ScheduleRequestResponse/ScheduleRequestResponse';
import ENV from '@/config/ENV';

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
                `${ENV.BACKEND_URL}/resources/schedule-requests/collection`,
            );

            set({
                listGardenWorkBrowse: response.data?.data || [],
                listGardenWorkBrowseFilter:
                    response.data?.data.filter(
                        (item: {status: any}) =>
                            item.status === EStatus.REQUEST,
                    ) || [],
                badgeGardenWorkUnBrowse:
                    response.data?.data.filter(
                        (item: {status: any}) =>
                            item.status === EStatus.REQUEST,
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
                `${ENV.BACKEND_URL}/resources/schedule-requests/verify/${harvestReportId}`,
                formRateReport,
            );

            set({isLoadingCreate: false});

            if (response.data?.data) {
                setTimeout(() => {
                    Snackbar.show({
                        text: `${response.data.message}`,
                        duration: Snackbar.LENGTH_LONG,
                    });
                }, 200);
            }

            return response.data;
        } catch (error: any) {
            set({isLoadingCreate: false});

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

    filterByStatus: status => {
        set({isLoadingCreate: true});

        // sử dụng setTimeout để fake async (nếu data quá dài filter có thể bị delay)
        set(state => ({
            listGardenWorkBrowseFilter: state.listGardenWorkBrowse.filter(
                item => item.status === status,
            ),
        }));

        setTimeout(() => {
            set({isLoadingCreate: false});
        }, 1000);
    },

    setBadgeUnBrowse: () =>
        set(state => ({
            badgeGardenWorkUnBrowse: state.listGardenWorkBrowse.filter(
                item => item.status === EStatus.REQUEST,
            ).length,
        })),

    resetData: () =>
        set(state => ({
            listGardenWorkBrowseFilter: state.listGardenWorkBrowse,
        })),
}));
