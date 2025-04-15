import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import asyncStorageHelper from '../utils/localStorageHelper/index';

const backendURL = 'http://cf15officeservice.checkee.vn';

const useAuthStore = create(set => ({
    userInfo: null,
    isLoading: false,
    isLogin: false,

    login: async (userAccount: any) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.post(
                `${backendURL}/login/sign-in`,
                userAccount,
            );

            if (response) {
                const userData = {
                    ...response.data.data,
                    avatar: `${backendURL}${response.data.data.avatar}`,
                };

                asyncStorageHelper.userAccount = userData;
                set({userInfo: userData, isLogin: true});
                set({isLoading: false});
            }
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            setTimeout(() => {
                if (_error.response.status === 401) {
                    Snackbar.show({
                        text: 'Tài khoản hoặc mật khẩu không chính xác',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }

                if (_error.response.status === 404) {
                    Snackbar.show({
                        text: 'Không tìm thấy api này',
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

    getUserDetail: async (userId: string) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/users/detail/:${userId}`,
            );

            console.log(response);

            if (response?.data?.data) {
                const userData = {
                    ...response.data.data,
                    avatar: `${backendURL}${response.data.data.avatar}`,
                };

                asyncStorageHelper.userAccount = userData;
                set({userInfo: userData, isLogin: true});
            }
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            console.log(_error);

            setTimeout(() => {
                if (_error.response.status === 404) {
                    Snackbar.show({
                        text: 'Không tìm thấy người dùng/nhân sự này!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }

                if (_error.response.status === 500) {
                    Snackbar.show({
                        text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
                        duration: Snackbar.LENGTH_SHORT,
                    });
                } else {
                    Snackbar.show({
                        text: 'Không thể kết nối đến máy chủ, hãy kiểm tra lại internet của bạn!',
                        duration: Snackbar.LENGTH_SHORT,
                    });
                }
            }, 100);
        }
    },

    autoLogin: (userAccount: any) => {
        set({isLoading: true});
        set({userInfo: userAccount, isLogin: true});
        set({isLoading: false});
    },

    logout: async () => {
        await asyncStorageHelper.clearUserAccount();
        await asyncStorageHelper.clearToken();
        set({userInfo: null, isLogin: false});
    },
}));

export default useAuthStore;
