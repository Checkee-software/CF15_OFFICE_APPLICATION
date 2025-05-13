import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IList} from '../shared-types/Response/ScheduleResponse/ScheduleResponse';
import {ISchedule} from '../shared-types/Response/ScheduleResponse/ScheduleResponse';
import {IApplyPersonalTask} from '@/shared-types/form-data/ScheduleFormData/ScheduleFormData';

const backendURL = 'http://cf15officeservice.checkee.vn';

interface workScheduleStore {
    isLoading: boolean;
    listWorkSchedule: IList[];
    listWorkScheduleFilter: IList[];
    detailWorkSchedule: ISchedule | null;
    getListWorkSchedule: () => Promise<void>;
    getDetailWorkSchedule: (mainTaskId: string) => Promise<void>;
    filterByStatus: (status: string) => void;
    resetData: () => void;
}

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return `http://cf15officeservice.checkee.vn${updatedPath}`;
};

export const useWorkScheduleStore = create<workScheduleStore>(set => ({
    isLoading: false,
    listWorkSchedule: [],
    listWorkScheduleFilter: [],
    detailWorkSchedule: null,

    getListWorkSchedule: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/schedules/collection`,
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

    getDetailWorkSchedule: async (mainTaskId: string) => {
        console.log('mainTaskId', mainTaskId);
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/schedules/detail/${mainTaskId}`,
            );

            console.log('response', response);

            if (response.data.data) {
                const updateImgPathDetailSchedule = response.data.data;
                updateImgPathDetailSchedule.employees =
                    response.data.data.employees.map((employees: any) => {
                        if (employees.avatar) {
                            employees.avatar = fixAvatarPath(employees.avatar);
                        }

                        return {...employees};
                    });
                // console.log(updateImgPathDetailSchedule);
                // set({
                //     detailWorkSchedule: updateImgPathDetailSchedule,
                // });

                set({isLoading: false});
                return updateImgPathDetailSchedule;
            }
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            console.log(_error.response);

            // setTimeout(() => {
            //     if (_error.response.status === 500) {
            //         Snackbar.show({
            //             text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
            //             duration: Snackbar.LENGTH_LONG,
            //         });
            //     }
            // }, 100);
        }
    },

    updateProgressTaskByImplementer: async (
        mainTaskId: string,
        formUpdateProgress: IApplyPersonalTask,
    ) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.post(
                `${backendURL}/resources/schedules/sub-tasks/apply-personal-task/${mainTaskId}`,
                formUpdateProgress,
            );
            set({isLoading: false});
            return response;
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            return _error.response;
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
