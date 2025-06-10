import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import asyncStorageHelper from '../utils/localStorageHelper/index';
import {
    ILogin,
    IUpdatePassword,
} from '../shared-types/form-data/UserFormData/UserFormData';
import {EScheduleStatus} from '@/shared-types/Response/ScheduleResponse/ScheduleResponse';
import UserType from '@/shared-types/common/UserType';
import Address from '@/shared-types/common/Address';

const backendURL = 'http://cf15dev.checkee.vn';

type tasks = {
    compeleted: string;
    expired: string;
    processing: string;
    total: string;
};

type IUser = {
    _id: string;
    status: boolean;
    avatar: string;
    username: string;
    fullName: string;
    nation: string;
    dateOfBirth: Date | undefined;
    recruimentDate: Date | undefined;
    contract: string;
    phoneNumber: string;
    ID: string;
    departmentName: string;
    userType: UserType.IUserType;
    address: Address.IAddresses;
    managedGardens: string[];
    tasks: tasks;
};

type AuthStore = {
    userInfo: IUser;
    userLogin: ILogin;
    userPasswordUpdate: IUpdatePassword;
    isLoading: boolean;
    isLogin: boolean;
    login: (userAccount: ILogin) => Promise<void>;
    autoLogin: () => Promise<void>;
    getScheduleCollection: () => Promise<
        | {
              total: Number;
              compeleted: Number;
              processing: Number;
              expired: Number;
          }
        | undefined
    >;
    logout: () => Promise<void>;
};

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return updatedPath;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
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

                const getTasks = await get().getScheduleCollection();
                userData.tasks = getTasks;

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

                const getTasks = await get().getScheduleCollection();
                userData.tasks = getTasks;

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

    getScheduleCollection: async () => {
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/schedules/collection`,
            );

            if (response.data.data) {
                const findTaskCompeleted = response.data.data.filter(
                    (item: any) => item.status === EScheduleStatus.COMPLETED,
                );
                const findTaskProcessing = response.data.data.filter(
                    (item: any) => item.status === EScheduleStatus.PROCESSING,
                );
                const findTaskExpired = response.data.data.filter(
                    (item: any) => item.status === EScheduleStatus.EXPIRED,
                );

                const tasks = {
                    total: response.data.data.length.toString(),
                    compeleted: findTaskCompeleted.length.toString(),
                    processing: findTaskProcessing.length.toString(),
                    expired: findTaskExpired.length.toString(),
                };

                return tasks;
            }
        } catch (error: any) {
            console.log(error);
        }
    },

    logout: async () => {
        await asyncStorageHelper.clearToken();
        set({userInfo: undefined, isLogin: false});
    },
}));
