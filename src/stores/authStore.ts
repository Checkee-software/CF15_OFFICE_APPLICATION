import {create} from 'zustand';
//import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import asyncStorageHelper from '../utils/localStorageHelper/index';

const backendURL = 'http://cf15officeservice.checkee.vn';

const useAuthStore = create(set => ({
    userInfo: null,
    isLoading: false,
    isLogin: false,

    login: async userAccount => {
        set({isLoading: true});
        try {
            const response = await axiosClient.post(
                `${backendURL}/login/sign-in`,
                userAccount,
            );

            if (response) {
                const userData = {
                    userId: response.data.data._id,
                    fullName: response.data.data.fullName,
                    address: response.data.data.address,
                    phoneNumber: response.data.data.phoneNumber,
                    userType: response.data.data.userType,
                    userName: response.data.data.username,
                };

                asyncStorageHelper.userAccount = userData;
                set({userInfo: userData, isLogin: true});
            }
        } catch (error: any) {
            if (error.response.status === 401) {
                Snackbar.show({
                    text: 'Tài khoản hoặc mật khẩu không chính xác',
                    duration: Snackbar.LENGTH_LONG,
                });
            }

            if (error.response.status === 404) {
                Snackbar.show({
                    text: 'Không tìm thấy api này',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }

            if (error.response.status === 500) {
                Snackbar.show({
                    text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
                    duration: Snackbar.LENGTH_LONG,
                });
            }
        } finally {
            set({isLoading: false});
        }
    },

    autoLogin: userAccount => {
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
