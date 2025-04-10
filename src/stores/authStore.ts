import {create} from 'zustand';
import {signIn} from '../service/UserService';
import {Alert} from 'react-native';

const useAuthStore = create(set => ({
    useInfo: null,
    isLoading: false,
    isLogin: false,

    login: async userAccount => {
        set({isLoading: true});
        try {
            const response = await signIn(userAccount); // gọi API đăng nhập
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
            //console.log(error);
            Alert.alert('Lỗi', 'Tài khoản hoặc mật khẩu không chính xác', [
                {text: 'OK'},
            ]);
            throw error;
        } finally {
            set({isLoading: false});
        }
    },

    logout: () => {
        set({userInfo: null, isLogin: false});
    },
}));

export default useAuthStore;
