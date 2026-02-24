import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {
    EScheduleStatus,
    ISchedule,
} from '../shared-types/Response/ScheduleResponse/ScheduleResponse';
import {
    IRequest,
    IRequestMaterial,
} from '@/shared-types/form-data/ScheduleRequestFormData/ScheduleRequestFormData';
import ENV from '@/config/ENV';
import {IProductType} from '@/shared-types/Response/ProductTypeResponse/ProductTypeResponse';
import moment from 'moment';
import asyncStorageHelper from '../utils/localStorageHelper/index';

interface IList {
    _id: string;
    status: string;
    title: string;
    description: string;
    startedDate: string;
    startedDateVN: string;
    finishedDateVN: string;
    finishedDate: string;
    totalEmployees: number;
    totalChildTasks: number;
    productId: string;
    productTypeId: string;
}

interface IProduct {
    _id: string;
    name: string;
}

interface workScheduleStore {
    isLoading: boolean;
    isLoadingGet: boolean;
    listWorkSchedule: IList[];
    listWorkScheduleFilter: IList[];
    listJobs: IList[];
    listProductType: IProductType[];
    listProduct: IProduct[];
    getListJobs: () => Promise<void>;
    detailWorkSchedule: ISchedule | null;
    scheduleDetail: ISchedule | null;
    getListWorkSchedule: () => Promise<void>;
    getScheduleDetail: (id: string) => Promise<void>;
    filterByStatus: (status: string) => void;
    filterWorkSchedule: (
        startedDate: string,
        finishedDate: string,
        productTypeId: string,
        productId: string,
    ) => void;
    resetData: () => void;
    getDetailWorkSchedule: (id: string, userId: string) => Promise<void>;
    requestPersonalTask: (
        scheduleId: string,
        childTaskId: string,
        data: Omit<IRequest, 'scheduleId' | 'childTaskId'>,
    ) => Promise<void>;
    requestAdditionalMaterial: (
        scheduleId: string,
        data: Omit<IRequestMaterial, 'scheduleId'>,
    ) => Promise<void>;
    getProductType: () => Promise<void>;
    getProduct: () => Promise<void>;
}

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return `${ENV.BACKEND_URL}${updatedPath}`;
};

const filterStaffByUserId = (data: any, userId: string) => {
    return {
        ...data,
        childTasks: data.childTasks.map((task: any) => ({
            ...task,
            staff: task.staff.filter((member: any) => member.userId === userId),
        })),
    };
};

export const useWorkScheduleStore = create<workScheduleStore>(set => ({
    isLoading: false,
    isLoadingGet: false,
    listWorkSchedule: [],
    listWorkScheduleFilter: [],
    detailWorkSchedule: null,
    scheduleDetail: null,
    listJobs: [],
    listProductType: [],
    listProduct: [],

    requestPersonalTask: async (
        scheduleId: string,
        childTaskId: string,
        data: Omit<IRequest, 'scheduleId' | 'childTaskId'>,
    ) => {
        set({isLoading: true});
        try {
            await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/schedule-requests/request/${scheduleId}/${childTaskId}`,
                data,
            );
            Snackbar.show({
                text: 'Gửi yêu cầu thành công!',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            console.log(error.response);
            Snackbar.show({
                text: error.response.data
                    ? error.response.data
                    : 'Gửi yêu cầu thất bại!',
                duration: Snackbar.LENGTH_LONG,
            });
        } finally {
            set({isLoading: false});
        }
    },

    requestAdditionalMaterial: async (scheduleId, data) => {
        set({isLoading: true});
        try {
            await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/schedules/request/${scheduleId}`,
                data,
            );
            Snackbar.show({
                text: 'Gửi yêu cầu cung ứng vật tư thành công!',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            console.error(
                '❌ Error sending additional material request:',
                error,
            );
            Snackbar.show({
                text: 'Gửi yêu cầu cung ứng vật tư thất bại!',
                duration: Snackbar.LENGTH_LONG,
            });
        } finally {
            set({isLoading: false});
        }
    },

    getDetailWorkSchedule: async (id: string, userId: string) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/detail-with-schedule/${id}`,
            );

            //console.log('📦 Response schedule:', response?.data);

            if (response?.data?.data) {
                const schedule: ISchedule = response.data.data;

                const filteredData = filterStaffByUserId(schedule, userId);

                const hasManyGarden = filteredData.childTasks.some(
                    (task: any) =>
                        task.staff.some(
                            (staff: any) => staff.gardens.length >= 2,
                        ),
                );

                if (hasManyGarden) {
                    const userGardenNickname =
                        asyncStorageHelper.userGardenNickname;

                    filteredData.childTasks.forEach((task: any) => {
                        task.staff.forEach((staff: any) => {
                            const userGarden = userGardenNickname.find(
                                u => u.userId === staff.userId,
                            );

                            staff.gardens = staff.gardens.map((garden: any) => {
                                const nickName = userGarden?.garden?.find(
                                    g => g.gardenId === garden.gardenId,
                                )?.gardenNickname;
                                return {
                                    ...garden,
                                    name: `${nickName || garden.name} - ${
                                        garden.groupName
                                    }`,
                                };
                            });
                        });
                    });
                }

                set({detailWorkSchedule: filteredData});
            } else {
                set({detailWorkSchedule: null});
            }
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể tải chi tiết công việc',
                duration: Snackbar.LENGTH_LONG,
            });
            set({detailWorkSchedule: null});
        } finally {
            set({isLoading: false});
        }
    },

    getListJobs: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/jobs`,
            );

            if (response?.data?.data) {
                set({listJobs: response.data.data});
            } else {
                set({listJobs: []});
            }
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể tải danh sách công việc khu vườn',
                duration: Snackbar.LENGTH_LONG,
            });
        } finally {
            set({isLoading: false});
        }
    },

    getProductType: async () => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/product-types/selection`,
            );

            set({listProductType: response.data.data || []});
        } catch (error: any) {
            set({isLoadingGet: false});

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

    getProduct: async () => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/products/selection`,
            );

            set({listProduct: response.data.data || []});
        } catch (error: any) {
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

    getListWorkSchedule: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/collection`,
            );

            if (response.data.data.length !== 0) {
                const convertedTime = response.data.data.map((item: any) => ({
                    ...item,
                    startedDateVN: moment(item.startedDate).format(
                        'DD/MM/YYYY',
                    ),
                    finishedDateVN: moment(item.finishedDate).format(
                        'DD/MM/YYYY',
                    ),
                }));

                set({
                    listWorkSchedule: convertedTime,
                    listWorkScheduleFilter: convertedTime.filter(
                        (item: any) =>
                            item.status === EScheduleStatus.PROCESSING,
                    ),
                });
            } else {
                set({
                    listWorkSchedule: [],
                    listWorkScheduleFilter: [],
                });
            }

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

    getScheduleDetail: async (id: string) => {
        set({isLoadingGet: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/detail/${id}`,
            );

            if (response.data.data) {
                const dataDetailSchedule = {...response.data.data};
                if (dataDetailSchedule.employees?.length) {
                    dataDetailSchedule.employees =
                        dataDetailSchedule.employees.map((employees: any) => {
                            if (employees.avatar) {
                                employees.avatar = fixAvatarPath(
                                    employees.avatar,
                                );
                            }
                            return employees;
                        });
                }

                set({
                    scheduleDetail: dataDetailSchedule,
                });
            } else {
                set({
                    scheduleDetail: null,
                });
            }

            setTimeout(() => {
                set({isLoadingGet: false});
            }, 200);
        } catch (error: any) {
            set({isLoadingGet: false});

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

    filterByStatus: status =>
        set(state => {
            let filterData = [];

            if (
                status === EScheduleStatus.ALMOST_EXPIRE ||
                status === EScheduleStatus.EXPIRED
            ) {
                const today = moment();

                filterData = state.listWorkSchedule
                    .filter(task => task.status !== EScheduleStatus.CANCELED)
                    .filter(task => {
                        const start = moment(task.startedDate); // ISO
                        const end = moment(task.finishedDate); // ISO

                        if (!start.isValid() || !end.isValid()) return false;

                        // Tổng thời gian của tiến trình
                        const totalDuration = end.diff(start);

                        // Thời gian còn lại
                        const remaining = end.diff(today);

                        // Thời gian còn lại còn <= 30% tổng thời gian
                        const threshold = totalDuration * 0.3;

                        if (status === EScheduleStatus.EXPIRED) {
                            return end.isBefore(today, 'day'); // finishedDate < hôm nay
                        }

                        if (status === EScheduleStatus.ALMOST_EXPIRE) {
                            // còn hạn nhưng <= 30% thời gian
                            return (
                                end.isAfter(today, 'day') &&
                                remaining <= threshold
                            );
                        }

                        return true;
                    });
            } else {
                filterData = state.listWorkSchedule.filter(
                    task => task.status === status,
                );
            }

            return {
                listWorkScheduleFilter: filterData,
            };
        }),

    filterWorkSchedule: (fromDate, toDate, productTypeId, productId) =>
        set(state => {
            const parseDate = (dateStr: string) => {
                const [day, month, year] = dateStr.split('/').map(Number);
                return new Date(year, month - 1, day);
            };

            const from = parseDate(fromDate);
            const to = parseDate(toDate);

            const filtered = state.listWorkSchedule.filter(item => {
                const itemStart = parseDate(item.startedDateVN);
                const itemEnd = parseDate(item.finishedDateVN);

                const isInRange = itemEnd >= from && itemStart <= to;

                const matchProductTypeId =
                    !productTypeId?.trim() ||
                    item.productTypeId === productTypeId;
                const matchProductId =
                    !productId?.trim() || item.productId === productId;

                return isInRange && matchProductTypeId && matchProductId;
            });

            return {
                listWorkScheduleFilter: filtered,
            };
        }),

    resetData: () =>
        set(state => ({listWorkScheduleFilter: state.listWorkSchedule})),
}));
