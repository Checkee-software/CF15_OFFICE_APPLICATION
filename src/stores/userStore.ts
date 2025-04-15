import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import asyncStorageHelper from '../utils/localStorageHelper/index';

const backendURL = 'http://cf15officeservice.checkee.vn';

const useUserStore = create(set => ({
    isLoading: false,

    getAvatar: async (userId: string) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/users/avatar?avatarById=${userId}`,
            );

            console.log(response);
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            setTimeout(() => {
                if (_error.response.status === 404) {
                    Snackbar.show({
                        text: 'Không tìm thấy ảnh đại diện!',
                        duration: Snackbar.LENGTH_SHORT,
                    });
                }

                if (_error.response.status === 500) {
                    Snackbar.show({
                        text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },
}));

export default useUserStore;
