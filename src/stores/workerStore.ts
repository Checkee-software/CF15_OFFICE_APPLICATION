import {create} from "zustand";
import axiosClient from "../utils/axiosClient";
import Snackbar from "react-native-snackbar";
import {IUser} from "../shared-types/Response/UserResponse/UserResponse";
import ENV from "@/config/ENV";
import {EOrganization} from "@/shared-types/common/Permissions/Permissions";

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
            workers?: IUser[];
            groupId?: string;
            groupName?: string;
            isUnit: boolean;
            quantity: number;
        },
    ];
}

interface IGroupedGarden {
    groupId: string;
    workers: IUser[];
}

interface DocumentStore {
    isLoading: boolean;
    listWorker: IUser[];
    listWorkerFilterByRole: listWorkerFilterByRole[];
    groupedGarden: IGroupedGarden[];
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

export const useWorkerStore = create<DocumentStore>(set => ({
    isLoading: false,
    listWorker: [],
    listWorkerFilterByRole: [],
    groupedGarden: [],

    getListWorkerByDepartment: async (userId: string, userLevel: string) => {
        set({isLoading: true});
        //await new Promise(resolve => setTimeout(resolve, 1 * 10000));
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/users/collection`,
            );

            if (response) {
                const updateImgPathListWorker = response.data.data.map(
                    (item: {avatar: string}) => {
                        if (item.avatar) {
                            item.avatar = fixAvatarPath(item.avatar);
                        }
                        return {
                            ...item,
                        };
                    },
                );

                const filterManagements = updateImgPathListWorker.filter(
                    (user: {_id: string; userType: {level: string}}) =>
                        user.userType.level === EOrganization.MANAGEMENT,
                );

                const filterDepartment = updateImgPathListWorker.filter(
                    (user: {
                        _id: string;
                        userType: {_id: string; level: string};
                    }) => user.userType.level === EOrganization.DEPARTMENT,
                );

                const filterLeaders = updateImgPathListWorker.filter(
                    (user: {_id: string; userType: {level: string}}) =>
                        user.userType.level === EOrganization.LEADER,
                );

                const filterUnit = Object.values(
                    updateImgPathListWorker
                        .filter(
                            (user: {_id: string; userType: {level: string}}) =>
                                user.userType.level === EOrganization.WORKER,
                        )
                        .reduce((acc: any, item: any) => {
                            const key = `${item.groupId}_${item.groupName}`;

                            if (!acc[key]) {
                                acc[key] = {
                                    groupId: item.groupId,
                                    groupName: item.groupName,
                                    quantity: 0,
                                    isUnit: true,
                                };
                            }

                            acc[key].quantity += 1;

                            return acc;
                        }, {}),
                );

                const groupGarden = Object.values(
                    updateImgPathListWorker
                        .filter(
                            (user: {_id: string; userType: {level: string}}) =>
                                user.userType.level === EOrganization.WORKER,
                        )
                        .reduce((acc: any, item: any) => {
                            const key = `${item.groupId}_${item.groupName}`;

                            if (!acc[key]) {
                                acc[key] = {
                                    groupId: item.groupId,
                                    workers: [],
                                };
                            }

                            acc[key].workers.push(item);
                            return acc;
                        }, {}),
                );

                const newListWorker = [
                    {
                        title: "Phòng ban",
                        data: filterDepartment,
                    },
                    {
                        title: "Cán bộ quản lý",
                        data: filterLeaders,
                    },
                    {
                        title: "Người lao động",
                        data: filterUnit,
                    },
                ];

                set({
                    listWorker:
                        userLevel === EOrganization.MANAGEMENT
                            ? updateImgPathListWorker
                            : updateImgPathListWorker.filter(
                                  (item: any) =>
                                      item.userType.level !==
                                      EOrganization.MANAGEMENT,
                              ),
                    listWorkerFilterByRole:
                        userLevel === EOrganization.DEPARTMENT
                            ? newListWorker
                            : [
                                  ...newListWorker,
                                  {
                                      title: "Ban lãnh đạo",
                                      data: filterManagements,
                                  },
                              ],
                    groupedGarden: groupGarden as IGroupedGarden[],
                });
            } else {
                set({listWorker: [], listWorkerFilterByRole: []});
            }

            set({isLoading: false});
        } catch (error: any) {
            const _error = error;
            set({isLoading: false});

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
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/users/collection`,
            );

            if (response) {
                const updateImgPathListWorker = response.data.data.map(
                    (item: {avatar: string}) => {
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
                updateImgPathListWorker.forEach((item: {order: number}) => {
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
                set({listWorker: [], listWorkerFilterByRole: []});
            }

            set({isLoading: false});
        } catch (error: any) {
            const _error = error;
            set({isLoading: false});

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
        set({listWorker: [], listWorkerFilterByRole: [], groupedGarden: []});
    },
}));
