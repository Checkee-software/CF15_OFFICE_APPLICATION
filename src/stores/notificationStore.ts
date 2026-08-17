import {create} from "zustand";
import axiosClient from "../utils/axiosClient";
import Snackbar from "react-native-snackbar";
import ENV from "@/config/ENV";

export interface INotification {
    _id: string;
    title: string;
    message: string;
}

export interface IBellNotification {
    _id: string;
    type: string;
    referenceId: string;
    actor: {
        _id: string;
        fullName: string;
        avatar: string;
    };
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationStore {
    notification: INotification | null;
    isLoading: boolean;
    fetchActiveNotification: () => Promise<void>;

    bellNotifications: IBellNotification[];
    unreadCount: number;
    isBellLoading: boolean;
    fetchBellNotifications: () => Promise<void>;

    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const useNotificationStore = create<NotificationStore>(set => ({
    notification: null,
    isLoading: false,

    bellNotifications: [],
    unreadCount: 0,
    isBellLoading: false,

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
                "FETCH_ACTIVE_NOTIFICATION_ERROR:",
                err?.response?.data || err?.message,
            );
            Snackbar.show({
                text: "Không thể tải thông báo.",
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchBellNotifications: async () => {
        set({isBellLoading: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/notifications/bells`,
            );

            const data = res?.data?.data?.data || [];
            const unread = res?.data?.data?.unreadCount || 0;

            set({
                bellNotifications: data,
                unreadCount: unread,
            });
        } catch (error: unknown) {
            const err = error as any;
            console.log(
                "FETCH_BELL_NOTIFICATIONS_ERROR:",
                err?.response?.data || err?.message,
            );
            Snackbar.show({
                text: "Không thể tải danh sách chuông thông báo.",
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isBellLoading: false});
        }
    },

    markAsRead: async (id: string) => {
        try {
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/notifications/mark-as-read/${id}`,
            );

            set(state => {
                const updatedList = state.bellNotifications.map(n =>
                    n._id === id ? {...n, isRead: true} : n,
                );
                const newUnreadCount = Math.max(
                    0,
                    state.unreadCount -
                        (state.bellNotifications.find(
                            n => n._id === id && !n.isRead,
                        )
                            ? 1
                            : 0),
                );

                return {
                    bellNotifications: updatedList,
                    unreadCount: newUnreadCount,
                };
            });
        } catch (error: unknown) {
            const err = error as any;
            console.log(
                "MARK_AS_READ_ERROR:",
                err?.response?.data || err?.message,
            );
            Snackbar.show({
                text: "Không thể đánh dấu thông báo.",
                duration: Snackbar.LENGTH_SHORT,
            });
        }
    },

    markAllAsRead: async () => {
        try {
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/notifications/mark-as-read-all`,
            );

            set(state => ({
                bellNotifications: state.bellNotifications.map(n => ({
                    ...n,
                    isRead: true,
                })),
                unreadCount: 0,
            }));

            Snackbar.show({
                text: "Tất cả thông báo đã được đánh dấu là đã đọc.",
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: unknown) {
            const err = error as any;
            console.log(
                "MARK_ALL_AS_READ_ERROR:",
                err?.response?.data || err?.message,
            );
            Snackbar.show({
                text: "Không thể đánh dấu tất cả thông báo.",
                duration: Snackbar.LENGTH_SHORT,
            });
        }
    },
}));

export default useNotificationStore;
