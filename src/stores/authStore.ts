import {create} from "zustand";
import axiosClient from "../utils/axiosClient";
import Snackbar from "react-native-snackbar";
import asyncStorageHelper from "../utils/localStorageHelper/index";
import {
    ILogin,
    IUpdatePassword,
} from "../shared-types/form-data/UserFormData/UserFormData";
import {EScheduleStatus} from "@/shared-types/Response/ScheduleResponse/ScheduleResponse";
import UserType from "@/shared-types/common/UserType";
import Address from "@/shared-types/common/Address";
import {OneSignal} from "react-native-onesignal";
import {
    EOrganization,
    IFunction,
} from "@/shared-types/common/Permissions/Permissions";
import ENV from "@/config/ENV";

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
    roleName: string;
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
    setTasksData: (payload: tasks) => void;
    autoLogin: () => Promise<void>;
    getScheduleCollection: () => Promise<tasks | undefined>;
    loadSupplementalUserInfo: (userData: IUser) => Promise<void>;
    logout: () => Promise<void>;
    updatePassword: (userPasswordUpdate: IUpdatePassword) => Promise<any>;
    setRedirectData: (type: string, data: string) => void;
    clearRedirectData: () => void;
    updateAvatar: (userId: string, uri: string) => Promise<void>;
};

const initialUserInfo: IUser = {
    _id: "",
    status: false,
    avatar: "",
    username: "",
    fullName: "",
    nation: "",
    dateOfBirth: undefined,
    recruimentDate: undefined,
    contract: "",
    phoneNumber: "",
    ID: "",
    departmentName: "",
    userType: {
        level: "",
        role: "",
        department: "",
        unit: "",
    } as UserType.IUserType,
    address: {} as Address.IAddresses,
    managedGardens: [],
    functions: [],
    tasks: {
        compeleted: "0",
        expired: "0",
        processing: "0",
        total: "0",
    },
    groupId: "",
    groupName: "",
    canViewSensitiveInfo: false,
    roleName: "",
};

const fixAvatarPath = (path: string) => {
    if (!path || typeof path !== "string") {
        return "";
    }

    const updatedPath = path.replace(/\\/g, "/").trim();

    if (/^https?:\/\//i.test(updatedPath)) {
        return updatedPath;
    }

    const baseUrl = ENV.BACKEND_URL.replace(/\/+$/, "");
    const normalizedPath = updatedPath.startsWith("/")
        ? updatedPath
        : `/${updatedPath}`;

    return `${baseUrl}${normalizedPath}`;
};

const resolveAvatarUrl = (avatar: any): string => {
    if (!avatar) {
        return "";
    }

    if (typeof avatar === "string") {
        return fixAvatarPath(avatar);
    }

    if (typeof avatar === "object") {
        if (typeof avatar.path === "string" && avatar.path) {
            return fixAvatarPath(avatar.path);
        }

        if (typeof avatar.url === "string" && avatar.url) {
            return fixAvatarPath(avatar.url);
        }

        if (
            typeof avatar.destination === "string" &&
            typeof avatar.filename === "string" &&
            avatar.filename
        ) {
            const destination = avatar.destination.replace(/\/+$/, "");
            return fixAvatarPath(`${destination}/${avatar.filename}`);
        }
    }

    return "";
};

const AUTH_REQUEST_TIMEOUT_MS = 15000;
const SUPPLEMENTAL_REQUEST_TIMEOUT_MS = 8000;

const getDefaultTasks = (): tasks => ({
    compeleted: "0",
    expired: "0",
    processing: "0",
    total: "0",
});

const shouldLoadTasks = (level?: string) =>
    level === EOrganization.DEPARTMENT ||
    level === EOrganization.LEADER ||
    level === EOrganization.WORKER;

const shouldLoadGroupName = (level?: string) =>
    level === EOrganization.LEADER || level === EOrganization.WORKER;

export const useAuthStore = create<AuthStore>((set, get) => ({
    userInfo: initialUserInfo,
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
                {timeout: AUTH_REQUEST_TIMEOUT_MS},
            );

            if (response.data.data) {
                const userData = {
                    ...response.data.data,
                };

                OneSignal.User.addAlias("userId", userData._id);

                userData.avatar = resolveAvatarUrl(response.data.data.avatar);
                userData.tasks = userData.tasks || getDefaultTasks();
                userData.groupName = userData.groupName || "";

                if (
                    response.data.data.userType.level ===
                        EOrganization.LEADER ||
                    response.data.data.userType.level === EOrganization.WORKER
                ) {
                    OneSignal.login(response.data.data._id);
                    OneSignal.User.pushSubscription.optIn();
                }

                set({userInfo: userData, isLogin: true, isLoading: false});
                get()
                    .loadSupplementalUserInfo(userData)
                    .catch(error =>
                        console.log(
                            "[authStore] Background supplemental load failed",
                            error,
                        ),
                    );
                return;
            }
            set({isLoading: false});
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
                        text: "Đã xảy ra lỗi, vui lòng thử lại!",
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
                        text: "Mật khẩu hiện tại không đúng! Hãy kiểm tra lại.",
                        //dòng dưới dùng khi api sửa lại đúng lỗi (hiện tại là Không tìm thấy người dùng!)
                        //text: _error.response.data,
                        duration: Snackbar.LENGTH_LONG,
                    });
                }

                if (_error.response.status === 500) {
                    Snackbar.show({
                        text: "Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!",
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
                {timeout: AUTH_REQUEST_TIMEOUT_MS},
            );

            if (response.data.data) {
                const userData = {
                    ...response.data.data,
                };

                userData.avatar = resolveAvatarUrl(response.data.data.avatar);
                userData.tasks = userData.tasks || getDefaultTasks();
                userData.groupName = userData.groupName || "";

                set({userInfo: userData, isLogin: true});
                get()
                    .loadSupplementalUserInfo(userData)
                    .catch(error =>
                        console.log(
                            "[authStore] Background supplemental load failed",
                            error,
                        ),
                    );
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
                        text: "Đã xảy ra lỗi, vui lòng thử lại!",
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    loadSupplementalUserInfo: async (userData: IUser) => {
        const userId = userData._id;
        const userLevel = userData.userType?.level;

        const tasksPromise = shouldLoadTasks(userLevel)
            ? get().getScheduleCollection()
            : Promise.resolve(undefined);

        const groupNamePromise = shouldLoadGroupName(userLevel)
            ? axiosClient
                  .get(`${ENV.BACKEND_URL}/resources/units/selection`, {
                      timeout: SUPPLEMENTAL_REQUEST_TIMEOUT_MS,
                  })
                  .then(responseGroup => {
                      const findGroupName = responseGroup.data.data.find(
                          (item: any) => item._id === userData.groupId,
                      );

                      return findGroupName?.name;
                  })
            : Promise.resolve(undefined);

        const [tasksResult, groupNameResult] = await Promise.allSettled([
            tasksPromise,
            groupNamePromise,
        ]);

        const updates: Partial<IUser> = {};

        if (tasksResult.status === "fulfilled" && tasksResult.value) {
            updates.tasks = tasksResult.value;
        } else if (tasksResult.status === "rejected") {
            console.log(
                "[authStore] Background load tasks failed",
                tasksResult.reason,
            );
        }

        if (
            groupNameResult.status === "fulfilled" &&
            typeof groupNameResult.value === "string"
        ) {
            updates.groupName = groupNameResult.value;
        } else if (groupNameResult.status === "rejected") {
            console.log(
                "[authStore] Background load group name failed",
                groupNameResult.reason,
            );
        }

        if (Object.keys(updates).length === 0) {
            return;
        }

        set(state => {
            if (!state.isLogin || state.userInfo._id !== userId) {
                return {};
            }

            return {
                userInfo: {
                    ...state.userInfo,
                    ...updates,
                },
            };
        });
    },

    getScheduleCollection: async () => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/schedules/collection`,
                {timeout: SUPPLEMENTAL_REQUEST_TIMEOUT_MS},
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
            type === "schdule"
                ? {redirectData: data}
                : type === "request"
                ? {redirectDataRequestSchedule: data}
                : {otherRedirect: type},
        ),
    setTasksData: (payload: tasks) =>
        set(state => ({
            userInfo: {
                ...state.userInfo,
                tasks: {
                    total: payload.total,
                    compeleted: payload.compeleted ?? "0",
                    processing: payload.processing,
                    expired: payload.expired,
                },
            },
        })),
    clearRedirectData: () =>
        set({
            redirectData: null,
            redirectDataRequestSchedule: null,
            otherRedirect: null,
        }),

    logout: async () => {
        await asyncStorageHelper.clearToken();
        const checkLevel = get().userInfo?.userType?.level;

        try {
            if (
                checkLevel === EOrganization.LEADER ||
                checkLevel === EOrganization.WORKER
            ) {
                OneSignal.User.pushSubscription.optOut();
                OneSignal.logout();
            }
        } catch (error) {
            console.log("[authStore] OneSignal logout failed", error);
        } finally {
            set({userInfo: initialUserInfo, isLogin: false});
        }
    },

    updateAvatar: async (userId: string, uri: string) => {
        try {
            const formData = new FormData();
            formData.append("avatar", {
                uri,
                name: "avatar.jpg",
                type: "image/jpeg",
            } as any);

            const res = await axiosClient.post(
                `${ENV.BACKEND_URL}/resources/users/update-avatar/${userId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            console.log(res);

            const updatedPath = resolveAvatarUrl(res.data?.data);
            if (updatedPath) {
                set(state => ({
                    userInfo: {
                        ...state.userInfo,
                        avatar: updatedPath,
                    },
                }));

                Snackbar.show({
                    text: "Cập nhật ảnh đại diện thành công!",
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        } catch (error: any) {
            console.log(error);
            Snackbar.show({
                text: "Không thể cập nhật ảnh đại diện!",
                duration: Snackbar.LENGTH_LONG,
            });
        }
    },
}));
