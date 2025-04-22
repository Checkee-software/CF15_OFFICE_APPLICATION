import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import useAuthStore from './authStore';
import {ICreate as ICreateFormData} from '../shared-types/form-data/FeedbackFormData/FeedbackFormData';

const backendURL = 'http://cf15officeservice.checkee.vn';

const useFeedbackStore = create(set => ({
    feedbacks: [],
    isLoading: false,

    getFullAvatarUrl: (avatarPath?: string): string => {
        if (!avatarPath) {
            return 'https://www.shutterstock.com/image-vector/user-icon-flat-style-person-260nw-1212192763.jpg';
        }

        if (avatarPath.startsWith('http')) {
            return avatarPath;
        }

        return `${backendURL}${avatarPath.replace(/\\/g, '/')}`;
    },

    submitFeedback: async (
        data: Pick<ICreateFormData, 'title' | 'content'>,
    ) => {
        const {userInfo} = useAuthStore.getState();
        const departmentCode = userInfo?.userType?.department;

        set({isLoading: true});

        const formData: ICreateFormData = {
            ...data,
            departmentCode,
        };

        try {
            const response = await axiosClient.post(
                `${backendURL}/resources/feedbacks`,
                formData,
            );

            if (response?.data?.data) {
                Snackbar.show({
                    text: 'Gửi góp ý thành công!',
                    duration: Snackbar.LENGTH_SHORT,
                });

                set(state => ({
                    feedbacks: [response.data.data, ...state.feedbacks],
                }));
            }
        } catch (error: unknown) {
            const err = error as any;
            console.log(
                'SUBMIT_FEEDBACK_ERROR:',
                err?.response?.data || err?.message,
            );
            if (err?.response?.status === 400) {
                Snackbar.show({
                    text: 'Góp ý không hợp lệ!',
                    duration: Snackbar.LENGTH_SHORT,
                });
            } else {
                Snackbar.show({
                    text: 'Đã xảy ra lỗi, vui lòng thử lại sau.',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        } finally {
            set({isLoading: false});
        }
    },

    fetchFeedbacks: async () => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${backendURL}/resources/feedbacks/collection`,
            );
            console.log('FETCH_FEEDBACKS_RESPONSE:', res.data);
            set({feedbacks: res.data?.data || []});
        } catch (error: unknown) {
            const err = error as any;
            console.log(
                'FETCH_FEEDBACKS_ERROR:',
                err?.response?.data || err?.message,
            );
            Snackbar.show({
                text: 'Không thể tải danh sách góp ý',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },
}));

export default useFeedbackStore;
