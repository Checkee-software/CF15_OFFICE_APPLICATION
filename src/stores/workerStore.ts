import { create } from "zustand";
import axiosClient from "../utils/axiosClient";
import Snackbar from "react-native-snackbar";
import { IUser } from "../shared-types/Response/UserResponse/UserResponse";
import ENV from "@/config/ENV";

interface listWorkerFilterByRole {
    title: string;
    data: [
        {
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
        },
    ];
}

interface DocumentStore {
    isLoading: boolean;
    listWorker: IUser[];
    listWorkerFilterByRole: listWorkerFilterByRole[];
    getListWorkerByDepartment: (
        userId: string,
        userLevel: string,
    ) => Promise<void>;
    getListWorkerByLeader: () => Promise<void>;
    resetStateWhenLogout: () => void;
}

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, "/");
    return `${ENV.BACKEND_URL}${updatedPath}`;
};

export const useWorkerStore = create<DocumentStore>((set) => ({
    isLoading: false,
    listWorker: [],
    listWorkerFilterByRole: [],

    getListWorkerByDepartment: async (userId: string, userLevel: string) => {
        set({ isLoading: true });
        //await new Promise(resolve => setTimeout(resolve, 1 * 10000));
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/users/collection`,
            );

            if (response) {
                const updateImgPathListWorker = response.data.data.map(
                    (item: { avatar: string }) => {
                        if (item.avatar) {
                            item.avatar = fixAvatarPath(item.avatar);
                        }
                        return {
                            ...item,
                        };
                    },
                );

                if (userLevel === "DEPARTMENT") {
                    const filterManagements = updateImgPathListWorker.filter(
                        (item: { userType: { level: string } }) =>
                            item.userType.level !== "MANAGEMENT",
                    );

                    const filterLeaders = filterManagements.filter(
                        (user: { userType: { level: string } }) =>
                            user.userType.level === "LEADER",
                    );

                    const filterWorkers = filterManagements.filter(
                        (user: {
                            _id: string;
                            userType: { _id: string; level: string };
                        }) =>
                            user.userType.level === "DEPARTMENT" &&
                            user._id !== userId,
                    );

                    //thêm order cho 2 mảng
                    let order = 0;
                    filterLeaders.forEach((item: { order: number }) => {
                        item.order = order += 1;
                    });

                    order = 0;

                    filterWorkers.forEach((item: { order: number }) => {
                        item.order = order += 1;
                    });

                    const newListWorker = [
                        {
                            title: "Cán bộ quản lý",
                            data: filterLeaders,
                        },
                        {
                            title: "Phòng ban",
                            data: filterWorkers,
                        },
                    ];

                    set({
                        listWorker: filterManagements,
                        listWorkerFilterByRole: newListWorker,
                    });
                } else {
                    const filterLeaders = updateImgPathListWorker.filter(
                        (item: { userType: { level: string } }) =>
                            item.userType.level !== "LEADER",
                    );

                    const filterManagements = filterLeaders.filter(
                        (user: { _id: string; userType: { level: string } }) =>
                            user.userType.level === "MANAGEMENT" &&
                            user._id !== userId,
                    );

                    const filterDepartment = filterLeaders.filter(
                        (user: {
                            _id: string;
                            userType: { _id: string; level: string };
                        }) =>
                            user.userType.level === "DEPARTMENT" &&
                            user._id !== userId,
                    );

                    //thêm order cho 2 mảng
                    let order = 0;
                    filterManagements.forEach((item: { order: number }) => {
                        item.order = order += 1;
                    });

                    order = 0;

                    filterDepartment.forEach((item: { order: number }) => {
                        item.order = order += 1;
                    });

                    const newListWorker = [
                        {
                            title: "Ban lãnh đạo",
                            data: filterManagements,
                        },
                        {
                            title: "Phòng ban",
                            data: filterDepartment,
                        },
                    ];

                    set({
                        listWorker: filterLeaders,
                        listWorkerFilterByRole: newListWorker,
                    });
                }
            } else {
                set({ listWorker: [], listWorkerFilterByRole: [] });
            }

            set({ isLoading: false });
        } catch (error: any) {
            const _error = error;
            set({ isLoading: false });

            setTimeout(() => {
                if (_error.response?.status === 500) {
                    Snackbar.show({
                        text: "Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!",
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    getListWorkerByLeader: async () => {
        set({ isLoading: true });
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/users/collection`,
            );

            if (response) {
                const updateImgPathListWorker = response.data.data.map(
                    (item: { avatar: string }) => {
                        if (item.avatar) {
                            item.avatar = fixAvatarPath(item.avatar);
                        }
                        return {
                            ...item,
                        };
                    },
                );

                // const filterRole = updateImgPathListWorker.filter(
                //     (user: {userType: {level: string}}) =>
                //         user.userType.level === 'WORKER',
                // );

                //thêm order cho mảng
                let order = 0;
                updateImgPathListWorker.forEach((item: { order: number }) => {
                    item.order = order += 1;
                });

                set({
                    listWorker: updateImgPathListWorker,
                    listWorkerFilterByRole: updateImgPathListWorker,
                });

                //đoạn code dưới này dùng khi nó đẻ ra thêm nhiều unit
                // const sortedUsers = filterRole.sort((a, b) =>
                //     a.unit.localeCompare(b.unit),
                // );

                // // Thêm order tăng dần toàn bộ
                // const usersWithOrder = sortedUsers.map((user, index) => ({
                //     ...user,
                //     order: index + 1,
                // }));

                // // Group lại theo unit
                // const groupedResult = [];

                // usersWithOrder.forEach(user => {
                //     const group = groupedResult.find(
                //         g => g.title === user.unit,
                //     );

                //     if (group) {
                //         group.data.push(user);
                //     } else {
                //         groupedResult.push({
                //             title: user.unit,
                //             data: [user],
                //         });
                //     }
                // });

                // newListWorker = groupedResult;

                // set({
                //     listWorker: usersWithOrder,
                //     listWorkerFilterByRole: newListWorker,
                // });
            } else {
                set({ listWorker: [], listWorkerFilterByRole: [] });
            }

            set({ isLoading: false });
        } catch (error: any) {
            const _error = error;
            set({ isLoading: false });

            setTimeout(() => {
                if (_error.response?.status === 500) {
                    Snackbar.show({
                        text: "Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!",
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    resetStateWhenLogout: () => {
        set({ listWorker: [], listWorkerFilterByRole: [] });
    },
}));
