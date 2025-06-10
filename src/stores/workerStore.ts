import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IUser} from '../shared-types/Response/UserResponse/UserResponse';

const backendURL = 'http://cf15dev.checkee.vn';

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
    getListWorkerByDepartment: () => Promise<void>;
    getListWorkerByLeader: () => Promise<void>;
    resetStateWhenLogout: () => void;
}

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return `http://cf15officeservice.checkee.vn${updatedPath}`;
};

export const useWorkerStore = create<DocumentStore>(set => ({
    isLoading: false,
    listWorker: [],
    listWorkerFilterByRole: [],

    getListWorkerByDepartment: async () => {
        set({isLoading: true});
        //await new Promise(resolve => setTimeout(resolve, 1 * 10000));
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/users/collection`,
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

                const filterLeaders = updateImgPathListWorker.filter(
                    (user: {userType: {level: string}}) =>
                        user.userType.level === 'LEADER',
                );

                const filterWorkers = updateImgPathListWorker.filter(
                    (user: {userType: {level: string}}) =>
                        user.userType.level !== 'LEADER',
                );

                //thêm order cho 2 mảng
                let order = 0;
                filterLeaders.forEach((item: {order: number}) => {
                    item.order = order += 1;
                });

                order = 0;

                filterWorkers.forEach((item: {order: number}) => {
                    item.order = order += 1;
                });

                const newListWorker = [
                    {
                        title: 'Cán bộ quản lý',
                        data: filterLeaders,
                    },
                    {
                        title: 'Người lao động',
                        data: filterWorkers,
                    },
                ];

                console.log(newListWorker);

                set({
                    listWorker: updateImgPathListWorker,
                    listWorkerFilterByRole: newListWorker,
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
                        text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
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
                `${backendURL}/resources/users/collection`,
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

                const filterRole = updateImgPathListWorker.filter(
                    (user: {userType: {level: string}}) =>
                        user.userType.level === 'WORKER',
                );

                //thêm order cho mảng
                let order = 0;
                filterRole.forEach((item: {order: number}) => {
                    item.order = order += 1;
                });

                set({
                    listWorker: filterRole,
                    listWorkerFilterByRole: filterRole,
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
                        text: 'Máy chủ đã xảy ra lỗi, vui lòng thử lại sau!',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    resetStateWhenLogout: () => {
        set({listWorker: [], listWorkerFilterByRole: []});
    },
}));
