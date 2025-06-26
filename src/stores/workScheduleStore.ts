import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IList} from '../shared-types/Response/ScheduleResponse/ScheduleResponse';
import {ISchedule} from '../shared-types/Response/ScheduleResponse/ScheduleResponse';
import {IRequest} from '@/shared-types/form-data/ScheduleRequestFormData/ScheduleRequestFormData';
import ENV from '@/config/ENV';

interface workScheduleStore {
    isLoading: boolean;
    isLoadingGet: boolean;
    listWorkSchedule: IList[];
    listWorkScheduleFilter: IList[];
    listJobs: IList[];
    getListJobs: () => Promise<void>;
    detailWorkSchedule: ISchedule | null;
    scheduleDetail: ISchedule | null;
    getListWorkSchedule: () => Promise<void>;
    getScheduleDetail: (id: string) => Promise<void>;
    filterByStatus: (status: string) => void;
    resetData: () => void;
    getDetailWorkSchedule: (id: string) => Promise<void>;
    requestPersonalTask: (
        scheduleId: string,
        childTaskId: string,
        data: Omit<IRequest, 'scheduleId' | 'childTaskId'>,
    ) => Promise<void>;
}

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return `${ENV.BACKEND_URL}${updatedPath}`;
};

export const useWorkScheduleStore = create<workScheduleStore>(set => ({
    isLoading: false,
    isLoadingGet: false,
    listWorkSchedule: [],
    listWorkScheduleFilter: [],
    detailWorkSchedule: null,
    scheduleDetail: null,
    listJobs: [],

    requestPersonalTask: async (
        scheduleId: string,
        childTaskId: string,
        data: Omit<IRequest, 'scheduleId' | 'childTaskId'>,
    ) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/schedule-requests/request/${scheduleId}/${childTaskId}`,
                data,
            );
            Snackbar.show({
                text: 'Gửi yêu cầu thành công!',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            console.error('❌ Error sending request:', error);
            Snackbar.show({
                text: 'Gửi yêu cầu thất bại!',
                duration: Snackbar.LENGTH_LONG,
            });
        } finally {
            set({isLoading: false});
        }
    },

    getDetailWorkSchedule: async (id: string) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/detail-with-schedule/${id}`,
            );

            console.log('📦 Response schedule:', response?.data);

            if (response?.data?.data) {
                const schedule: ISchedule = response.data.data;

                if (schedule?.employees?.length) {
                    schedule.employees = schedule.employees.map((emp: any) => {
                        if (emp.avatar) {
                            emp.avatar = fixAvatarPath(emp.avatar);
                        }
                        return emp;
                    });
                }

                set({detailWorkSchedule: schedule});
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

    getListWorkSchedule: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/collection`,
            );

            if (response) {
                const updateImgPathListSchedule = response.data.data.map(
                    (item: any) => {
                        item.employees.map((employees: any) => {
                            if (employees.avatar) {
                                employees.avatar = fixAvatarPath(
                                    employees.avatar,
                                );
                            }

                            return {...employees};
                        });

                        return {
                            ...item,
                        };
                    },
                );

                set({
                    listWorkSchedule: updateImgPathListSchedule,
                    listWorkScheduleFilter: updateImgPathListSchedule,
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
        set(state => ({
            listWorkScheduleFilter: state.listWorkSchedule.filter(
                task => task.status === status,
            ),
        })),

    resetData: () =>
        set(state => ({listWorkScheduleFilter: state.listWorkSchedule})),
}));
