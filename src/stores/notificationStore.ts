import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import ENV from '@/config/ENV';

export interface INotification {
    _id: string;
    title: string;
    message: string;
}

interface NotificationStore {
    notification: INotification | null;
    isLoading: boolean;
    fetchActiveNotification: () => Promise<void>;
}

const useNotificationStore = create<NotificationStore>(set => ({
    notification: null,
    isLoading: false,

    fetchActiveNotification: async () => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/notifications/active`,
            );

            const data = res?.data?.data || null;

            set({notification: data});
        } catch (error: unknown) {
            const err = error as any;
            console.log(
                'FETCH_ACTIVE_NOTIFICATION_ERROR:',
                err?.response?.data || err?.message,
            );
            Snackbar.show({
                text: 'Không thể tải thông báo.',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },
}));

export default useNotificationStore;
