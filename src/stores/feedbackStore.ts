import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';

const backendURL = 'http://cf15officeservice.checkee.vn';

const useFeedbackStore = create(set => ({
    feedbacks: [],
    isLoading: false,

    submitFeedback: async (title: string, content: string) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.post(
                `${backendURL}/resources/feedbacks`,
                {title, content},
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
        } catch (error: any) {
            console.log(
                'SUBMIT_FEEDBACK_ERROR:',
                error?.response?.data || error.message,
            );
            if (error.response?.status === 400) {
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
                `${backendURL}/resources/feedbacks`,
            );
            set({feedbacks: res.data?.data || []});
        } catch (error) {
            console.log(
                'FETCH_FEEDBACKS_ERROR:',
                error?.response?.data || error.message,
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
