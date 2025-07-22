import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IRateReportHarvest} from '@/shared-types/form-data/HarvestHistoryFormData/HarvestHistoryFormData';
import {EStatus} from '@/shared-types/Response/ScheduleRequestResponse/ScheduleRequestResponse';
import ENV from '@/config/ENV';
import {IMaterialsByStaff} from '@/shared-types/Response/ScheduleResponse/ScheduleResponse';

type IGardenData = {
    _id: string;
    gardenId: string;
    type: string;
    name: string; // Tên định mức
    amount: number; // Khối lượng thu hoạch hoặc đinh mức
    status: string;
    verifier: string;
    message: string;
    currentLifeParent: number;
    gardenName?: string;
    gardenCode?: string;
    createdAt?: Date;
    updatedAt?: Date;
    childTaskId: string;
    requesterId: string;
    firstRequested: boolean;
};

interface gardenWorkStore {
    isLoading: boolean;
    isLoadingCreate: boolean;
    listGardenWorkBrowse: IGardenData[];
    listGardenWorkBrowseFilter: IGardenData[];
    badgeGardenWorkUnBrowse: number;
    listMaterialsBrowse: IMaterialsByStaff[];
    listMaterialsBrowseFilter: IMaterialsByStaff[];
    badgeMaterialsUnBrowse: number;
    getRequestDataGarden: () => Promise<any>;
    createRateReportHarvest: (
        harvestReportId: string,
        formRateReport: IRateReportHarvest,
    ) => Promise<void | undefined>;
    filterByStatus: (status: string) => void;
    resetData: () => void;
    setBadgeUnBrowse: () => void;
    filterAddMaterialsByStatus: (status: string) => void;
    getRequestAddingMaterials: () => Promise<any>;
    createAddingMaterials: (
        materialId: string,
        scheduleId: string,
        formRateReport: IRateReportHarvest,
    ) => Promise<void | undefined>;
}

export const useGardenWorkStore = create<gardenWorkStore>((set, get) => ({
    isLoading: false,
    isLoadingCreate: false,
    badgeGardenWorkUnBrowse: 0,
    listGardenWorkBrowse: [],
    listGardenWorkBrowseFilter: [],
    listMaterialsBrowse: [],
    listMaterialsBrowseFilter: [],
    badgeMaterialsUnBrowse: 0,

    getRequestDataGarden: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get<any>(
                `${ENV.BACKEND_URL}/resources/schedule-requests/collection`,
            );

            const filteredData = (() => {
                const map = new Map();
                const result = [];

                for (let i = response.data.data.length - 1; i >= 0; i--) {
                    const item = response.data.data[i];

                    if (item.status === 'CONFIRMED') {
                        const key = `${item.createdBy}-${item.childTaskId}`;

                        if (!map.has(key)) {
                            map.set(key, true);
                            result.unshift(item); // giữ thứ tự ban đầu
                        }
                    } else {
                        result.unshift(item); // luôn giữ lại các item khác CONFIRMED
                    }
                }

                return result;
            })();

            set({
                listGardenWorkBrowse: filteredData,
                listGardenWorkBrowseFilter: filteredData || [],
                badgeGardenWorkUnBrowse:
                    response.data.data.filter(
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

    getRequestAddingMaterials: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get<any>(
                `${ENV.BACKEND_URL}/resources/schedules/list-request`,
            );

            set({
                listMaterialsBrowse: response.data.data,
                listMaterialsBrowseFilter: response.data.data || [],
                badgeMaterialsUnBrowse:
                    response.data.data.filter(
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

    filterAddMaterialsByStatus: status => {
        set({isLoadingCreate: true});

        set(state => ({
            listMaterialsBrowseFilter: state.listMaterialsBrowse.filter(
                item => item.status === status,
            ),
        }));

        setTimeout(() => {
            set({isLoadingCreate: false});
        }, 1000);
    },

    createAddingMaterials: async (
        materialId: string,
        scheduleId: string,
        formRateReport: IRateReportHarvest,
    ) => {
        set({isLoadingCreate: true});
        try {
            const response = await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/schedules/confirm/${scheduleId}/${materialId}`,
                formRateReport,
            );

            set({isLoadingCreate: false});

            if (response.data?.data) {
                setTimeout(() => {
                    Snackbar.show({
                        text: response.data.message,
                        duration: Snackbar.LENGTH_LONG,
                    });
                }, 500);
            }

            return response.data;
        } catch (error: any) {
            set({isLoadingCreate: false});

            const _error = error;

            console.log(_error.response);

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
                }, 500);
            }

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

    filterByStatus: status => {
        const {listGardenWorkBrowse} = get();
        set({isLoadingCreate: true});

        // sử dụng setTimeout để fake async (nếu data quá dài filter có thể bị delay)
        if (status !== EStatus.REQUEST) {
            const dataFiltered = listGardenWorkBrowse.filter(
                (item: any) => item.status === status,
            );

            const groupMap = new Map();

            dataFiltered.forEach((item, index) => {
                const key = `${item.childTaskId}-${item.requesterId}`;
                if (!groupMap.has(key)) groupMap.set(key, []);
                groupMap.get(key).push(index);
            });

            groupMap.forEach(indexes => {
                if (indexes.length > 1) {
                    dataFiltered[indexes[0]].firstRequested = true;
                }
            });

            set({
                listGardenWorkBrowseFilter: dataFiltered,
            });
        } else {
            set(state => ({
                listGardenWorkBrowseFilter: state.listGardenWorkBrowse.filter(
                    item => item.status === status,
                ),
            }));
        }

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
