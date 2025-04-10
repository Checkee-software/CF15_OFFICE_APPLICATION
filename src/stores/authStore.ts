import {create} from 'zustand';
import {signIn} from '../service/UserService';
import {Alert} from 'react-native';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';

const backendURL = 'http://cf15officeservice.checkee.vn';

const useAuthStore = create(set => ({
    useInfo: null,
    isLoading: false,
    isLogin: false,

    login: async userAccount => {
        set({isLoading: true});
        try {
            const response = await axios.post(
                `${backendURL}/login/sign-in`,
                userAccount,
            );
            //const token = response.data?.tokenDTO?.token;

            if (response) {
                const userData = {
                    fullName: response.data.data.fullName,
                    address: response.data.data.address,
                    phoneNumber: response.data.data.phoneNumber,
                    userType: response.data.data.userType,
                    userName: response.data.data.username,
                };
                set({userInfo: userData, isLogin: true});
            }
        } catch (error) {
            if (error.response.status === 401) {
                Snackbar.show({
                    text: 'Tài khoản hoặc mật khẩu không chính xác',
                    duration: Snackbar.LENGTH_SHORT,
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
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        } finally {
            set({isLoading: false});
        }
    },

    logout: () => {
        set({userInfo: null, isLogin: false});
    },
}));

export default useAuthStore;
