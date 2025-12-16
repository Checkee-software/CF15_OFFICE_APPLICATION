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
import {OneSignal} from 'react-native-onesignal';
import {
    EOrganization,
    IFunction,
} from '@/shared-types/common/Permissions/Permissions';
import ENV from '@/config/ENV';

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
    functions: IFunction[];
    tasks: tasks;
    groupId: string;
    groupName: string;
    canViewSensitiveInfo: boolean;
};

type AuthStore = {
    userInfo: IUser;
    userLogin: ILogin;
    userPasswordUpdate: IUpdatePassword;
    isLoading: boolean;
    isLogin: boolean;
    redirectData: string | null;
    redirectDataRequestSchedule: string | null;
    otherRedirect: string | null;
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
    updatePassword: (userPasswordUpdate: IUpdatePassword) => Promise<any>;
    setRedirectData: (type: string, data: string) => void;
    clearRedirectData: () => void;
    updateAvatar: (userId: string, uri: string) => Promise<void>;
};

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return updatedPath;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
    userInfo: {} as IUser,
    userLogin: {} as ILogin,
    userPasswordUpdate: {} as IUpdatePassword,
    redirectData: null,
    redirectDataRequestSchedule: null,
    otherRedirect: null,
    isLoading: false,
    isLogin: false,

    login: async (userAccount: ILogin) => {
        try {
            set({isLoading: true});
            const response = await axiosClient.post(
                `${ENV.BACKEND_URL}/login/sign-in`,
                userAccount,
            );

            if (response.data.data) {
                const userData = {
                    ...response.data.data,
                };

                OneSignal.User.addAlias('userId', userData._id);

                if (response.data.data.avatar) {
                    userData.avatar = `${ENV.BACKEND_URL}${fixAvatarPath(
                        response.data.data.avatar.path
                            ? response.data.data.avatar.path
                            : response.data.data.avatar,
                    )}`;
                } else {
                    userData.avatar = '';
                }

                if (
                    response.data.data.userType.level ===
                        EOrganization.DEPARTMENT ||
                    response.data.data.userType.level ===
                        EOrganization.LEADER ||
                    response.data.data.userType.level === EOrganization.WORKER
                ) {
                    const getTasks = await get().getScheduleCollection();
                    userData.tasks = getTasks;
                }

                if (
                    response.data.data.userType.level ===
                        EOrganization.LEADER ||
                    response.data.data.userType.level === EOrganization.WORKER
                ) {
                    OneSignal.login(response.data.data._id);
                    OneSignal.User.pushSubscription.optIn();

                    const responseGroup = await axiosClient.get(
                        `${ENV.BACKEND_URL}/resources/units/selection`,
                    );

                    const findGroupName = responseGroup.data.data.find(
                        (item: any) => item._id === response.data.data.groupId,
                    );

                    userData.groupName = findGroupName.name;
                }
                set({isLoading: false});
                set({userInfo: userData, isLogin: true});
            }
            set({isLoading: false});
        } catch (error: any) {
            set({isLoading: false});

            console.log(error.response);

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
                `${ENV.BACKEND_URL}/resources/update-password`,
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
                `${ENV.BACKEND_URL}/resources/check-access`,
            );

            if (response.data.data) {
                const userData = {
                    ...response.data.data,
                };

                if (response.data.data.avatar) {
                    userData.avatar = `${ENV.BACKEND_URL}${fixAvatarPath(
                        response.data.data.avatar.path
                            ? response.data.data.avatar.path
                            : response.data.data.avatar,
                    )}`;
                } else {
                    userData.avatar = '';
                }

                if (
                    response.data.data.userType.level ===
                        EOrganization.DEPARTMENT ||
                    response.data.data.userType.level ===
                        EOrganization.LEADER ||
                    response.data.data.userType.level === EOrganization.WORKER
                ) {
                    const getTasks = await get().getScheduleCollection();
                    userData.tasks = getTasks;
                }

                if (
                    response.data.data.userType.level ===
                        EOrganization.LEADER ||
                    response.data.data.userType.level === EOrganization.WORKER
                ) {
                    const responseGroup = await axiosClient.get(
                        `${ENV.BACKEND_URL}/resources/units/selection`,
                    );

                    const findGroupName = responseGroup.data.data.find(
                        (item: any) => item._id === response.data.data.groupId,
                    );

                    userData.groupName = findGroupName.name;
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

    getScheduleCollection: async () => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/collection`,
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

    setRedirectData: (type: string, data: string) =>
        set(
            type === 'schdule'
                ? {redirectData: data}
                : type === 'request'
                ? {redirectDataRequestSchedule: data}
                : {otherRedirect: type},
        ),
    clearRedirectData: () =>
        set({
            redirectData: null,
            redirectDataRequestSchedule: null,
            otherRedirect: null,
        }),

    logout: async () => {
        await asyncStorageHelper.clearToken();
        const checkLevel = get().userInfo.userType.level;
        if (
            checkLevel === EOrganization.LEADER ||
            checkLevel === EOrganization.WORKER
        ) {
            OneSignal.User.pushSubscription.optOut();
            OneSignal.logout();
        }
        set({userInfo: undefined, isLogin: false});
    },

    updateAvatar: async (userId: string, uri: string) => {
        try {
            const formData = new FormData();
            formData.append('avatar', {
                uri,
                name: 'avatar.jpg',
                type: 'image/jpeg',
            } as any);

            const res = await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/users/update-avatar/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            console.log(res);

            if (res.data?.data?.path) {
                const updatedPath = `${ENV.BACKEND_URL}${fixAvatarPath(
                    res.data.data.path,
                )}`;
                set(state => ({
                    userInfo: {
                        ...state.userInfo,
                        avatar: updatedPath,
                    },
                }));

                Snackbar.show({
                    text: 'Cập nhật ảnh đại diện thành công!',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        } catch (error: any) {
            console.log(error);
            Snackbar.show({
                text: 'Không thể cập nhật ảnh đại diện!',
                duration: Snackbar.LENGTH_LONG,
            });
        }
    },
}));
