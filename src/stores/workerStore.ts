import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IUser} from '../shared-types/Response/UserResponse/UserResponse';

const backendURL = 'http://cf15officeservice.checkee.vn';

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
    getListWorker: () => Promise<void>;
}

const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return `http://cf15officeservice.checkee.vn${updatedPath}`;
};

export const useWorkerStore = create<DocumentStore>(set => ({
    isLoading: false,
    listWorker: [],
    listWorkerFilterByRole: [],

    getListWorker: async () => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${backendURL}/resources/users/collection`,
            );

            if (response) {
                const updateImgPathListWorker = response.data.data.map(item => {
                    if (item.avatar) {
                        item.avatar = fixAvatarPath(item.avatar);
                    }
                    return {
                        ...item,
                    };
                });

                const filterLeaders = updateImgPathListWorker.filter(
                    user => user.userType.level === 'LEADER',
                );

                const filterWorkers = updateImgPathListWorker.filter(
                    user => user.userType.level !== 'LEADER',
                );

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
}));
