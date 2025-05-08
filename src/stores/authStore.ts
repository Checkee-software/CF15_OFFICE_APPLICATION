import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import asyncStorageHelper from '../utils/localStorageHelper/index';
import {IUser} from '../shared-types/Response/UserResponse/UserResponse';
import {
    ILogin,
    IUpdatePassword,
} from '../shared-types/form-data/UserFormData/UserFormData';

const backendURL = 'http://cf15officeservice.checkee.vn';

type AuthStore = {
    userInfo: IUser;
    userLogin: ILogin;
    userPasswordUpdate: IUpdatePassword;
    isLoading: boolean;
    isLogin: boolean;
    login: (userAccount: ILogin) => Promise<void>;
    autoLogin: () => Promise<void>;
    logout: () => Promise<void>;
};

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return updatedPath;
};

export const useAuthStore = create<AuthStore>(set => ({
    userInfo: {} as IUser,
    userLogin: {} as ILogin,
    userPasswordUpdate: {} as IUpdatePassword,
    isLoading: false,
    isLogin: false,

    login: async (userAccount: ILogin) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.post(
                `${backendURL}/login/sign-in`,
                userAccount,
            );

            if (response.data.data) {
                const userData = {
                    ...response.data.data,
                };

                if (response.data.data.avatar) {
                    userData.avatar = `${backendURL}${fixAvatarPath(
                        response.data.data.avatar.path
                            ? response.data.data.avatar.path
                            : response.data.data.avatar,
                    )}`;
                } else {
                    userData.avatar = '';
                }

                set({userInfo: userData, isLogin: true});
                set({isLoading: false});
            }
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            setTimeout(() => {
                if (_error?.response?.data) {
                    Snackbar.show({
                        text: _error.response.data,
                        duration: Snackbar.LENGTH_LONG,
                    });
                } else {
                    Snackbar.show({
                        text: 'Đã xảy ra lỗi, vui lòng thử lại!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    updatePassword: async (userPasswordUpdate: IUpdatePassword) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.patch(
                `${backendURL}/resources/update-password`,
                userPasswordUpdate,
            );

            set({isLoading: false});

            return response.data.data;
        } catch (error: any) {
            set({isLoading: false});

            const _error = error;

            setTimeout(() => {
                if (_error.response.status === 404) {
                    Snackbar.show({
                        text: 'Mật khẩu hiện tại không đúng! Hãy kiểm tra lại.',
                        //dòng dưới dùng khi api sửa lại đúng lỗi (hiện tại là Không tìm thấy người dùng!)
                        //text: _error.response.data,
                        duration: Snackbar.LENGTH_LONG,
                    });
                }

                if (_error.response.status === 500) {
                    Snackbar.show({
                        text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
            return false;
        }
    },

    autoLogin: async () => {
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/check-access`,
            );

            if (response.data.data) {
                const userData = {
                    ...response.data.data,
                };

                if (response.data.data.avatar) {
                    userData.avatar = `${backendURL}${fixAvatarPath(
                        response.data.data.avatar.path
                            ? response.data.data.avatar.path
                            : response.data.data.avatar,
                    )}`;
                } else {
                    userData.avatar = '';
                }

                set({userInfo: userData, isLogin: true});
            }
        } catch (error: any) {
            const _error = error;

            setTimeout(() => {
                if (_error?.response?.data) {
                    Snackbar.show({
                        text: _error.response.data,
                        duration: Snackbar.LENGTH_LONG,
                    });
                } else {
                    Snackbar.show({
                        text: 'Đã xảy ra lỗi, vui lòng thử lại!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    logout: async () => {
        await asyncStorageHelper.clearToken();
        set({userInfo: undefined, isLogin: false});
    },
}));

// const useAuthStore = create(set => ({
//     userInfo: null,
//     isLoading: false,
//     isLogin: false,

//     login: async (userAccount: any) => {
//         set({isLoading: true});
//         try {
//             const response = await axiosClient.post(
//                 `${backendURL}/login/sign-in`,
//                 userAccount,
//             );

//             if (response.data.data) {
//                 const userData = {
//                     ...response.data.data,
//                 };

//                 if (response.data.data.avatar) {
//                     userData.avatar = `${backendURL}${fixAvatarPath(
//                         response.data.data.avatar.path
//                             ? response.data.data.avatar.path
//                             : response.data.data.avatar,
//                     )}`;
//                 } else {
//                     userAccount.avatar = '';
//                 }

//                 set({userInfo: userData, isLogin: true});
//                 set({isLoading: false});
//             }
//         } catch (error: any) {
//             set({isLoading: false});

//             const _error = error;

//             setTimeout(() => {
//                 if (_error?.response?.data) {
//                     Snackbar.show({
//                         text: _error.response.data,
//                         duration: Snackbar.LENGTH_LONG,
//                     });
//                 } else {
//                     Snackbar.show({
//                         text: 'Đã xảy ra lỗi, vui lòng thử lại!',
//                         duration: Snackbar.LENGTH_LONG,
//                     });
//                 }
//             }, 100);
//         }
//     },

//     getUserDetail: async (userId: string) => {
//         set({isLoading: true});
//         try {
//             const response = await axiosClient.get(
//                 `${backendURL}/resources/users/detail/:${userId}`,
//             );

//             if (response?.data?.data) {
//                 const userData = {
//                     ...response.data.data,
//                     avatar: `${backendURL}${response.data.data.avatar}`,
//                 };

//                 set({userInfo: userData, isLogin: true});
//             }
//         } catch (error: any) {
//             set({isLoading: false});

//             const _error = error;

//             console.log(_error);

//             setTimeout(() => {
//                 if (_error.response.status === 404) {
//                     Snackbar.show({
//                         text: 'Không tìm thấy người dùng/nhân sự này!',
//                         duration: Snackbar.LENGTH_LONG,
//                     });
//                 }

//                 if (_error.response.status === 500) {
//                     Snackbar.show({
//                         text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
//                         duration: Snackbar.LENGTH_SHORT,
//                     });
//                 } else {
//                     Snackbar.show({
//                         text: 'Không thể kết nối đến máy chủ, hãy kiểm tra lại internet của bạn!',
//                         duration: Snackbar.LENGTH_SHORT,
//                     });
//                 }
//             }, 100);
//         }
//     },

//     updatePassword: async (userAccount: userAccount) => {
//         set({isLoading: true});
//         try {
//             const response = await axiosClient.patch(
//                 `${backendURL}/resources/update-password`,
//                 userAccount,
//             );

//             set({isLoading: false});

//             return response.data.data;
//         } catch (error: any) {
//             set({isLoading: false});

//             const _error = error;

//             setTimeout(() => {
//                 if (_error.response.status === 404) {
//                     Snackbar.show({
//                         text: 'Mật khẩu hiện tại không đúng! Hãy kiểm tra lại.',
//                         //dòng dưới dùng khi api sửa lại đúng lỗi (hiện tại là Không tìm thấy người dùng!)
//                         //text: _error.response.data,
//                         duration: Snackbar.LENGTH_LONG,
//                     });
//                 }

//                 if (_error.response.status === 500) {
//                     Snackbar.show({
//                         text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
//                         duration: Snackbar.LENGTH_LONG,
//                     });
//                 }
//             }, 100);
//             return false;
//         }
//     },

//     autoLogin: async () => {
//         try {
//             const response = await axiosClient.get(
//                 `${backendURL}/resources/check-access`,
//             );

//             if (response.data.data) {
//                 console.log(response);

//                 const userData = {
//                     ...response.data.data,
//                 };

//                 if (response.data.data.avatar) {
//                     userData.avatar = `${backendURL}${fixAvatarPath(
//                         response.data.data.avatar.path
//                             ? response.data.data.avatar.path
//                             : response.data.data.avatar,
//                     )}`;
//                 } else {
//                     userData.avatar = '';
//                 }

//                 console.log(userData);

//                 set({userInfo: userData, isLogin: true});
//                 return true;
//             }
//         } catch (error: any) {
//             const _error = error;

//             setTimeout(() => {
//                 if (_error?.response?.data) {
//                     Snackbar.show({
//                         text: _error.response.data,
//                         duration: Snackbar.LENGTH_LONG,
//                     });
//                 } else {
//                     Snackbar.show({
//                         text: 'Đã xảy ra lỗi, vui lòng thử lại!',
//                         duration: Snackbar.LENGTH_LONG,
//                     });
//                 }
//             }, 100);
//         }
//     },

//     logout: async () => {
//         await asyncStorageHelper.clearToken();
//         set({userInfo: null, isLogin: false});
//     },
// }));

// export default useAuthStore;
