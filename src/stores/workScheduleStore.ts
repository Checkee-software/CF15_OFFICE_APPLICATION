import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IList} from '../shared-types/Response/ScheduleResponse/ScheduleResponse';

const backendURL = 'http://cf15officeservice.checkee.vn';

interface workScheduleStore {
    isLoading: boolean;
    listWorkSchedule: IList[];
    listWorkScheduleFilter: IList[];
    getListWorkSchedule: () => Promise<void>;
}

export const useWorkScheduleStore = create<workScheduleStore>(set => ({
    isLoading: false,
    listWorkSchedule: [],
    listWorkScheduleFilter: [],

    getListWorkSchedule: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/schedules/collection`,
            );

            set({
                listWorkSchedule: response.data?.data || [],
                listWorkScheduleFilter: response.data?.data || [],
            });
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

    filterByStatus: status =>
        set(state => ({
            listWorkScheduleFilter: state.listWorkSchedule.filter(
                task => task.status === status,
            ),
        })),

    resetData: () =>
        set(state => ({listWorkScheduleFilter: state.listWorkSchedule})),
}));
