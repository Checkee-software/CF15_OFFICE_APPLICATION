import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import ENV from '@/config/ENV';

export type TypeGroupId = {
    _id: string;
    name: string;
    code: string;
};

export type TypeProduct = {
    _id: string;
    name: string;
};

export type TypeSchedulesHarvest = {
    description: string;
    employeeCount: number;
    finishedDate: string;
    followerCount: number;
    startedDate: string;
    status: string;
    title: string;
    totalParticipants: number;
    totalYield: number;
    _id: string;
};

export type TypeGroupProgress = {
    groupId: string;
    name: string;
    code: string;
    users: {
        userId: {
            _id: string;
            fullName: string;
            groupId: string;
        };
        gardens: {
            gardenId: {
                _id: string;
                code: string;
            };
            quantity: number;
        }[];
    }[];
};

export type TypeDetailScheduleHarvest = {
    createdBy: {_id: string; fullName: string};
    description: string;
    employeeIds: [
        {
            _id: string;
            fullName: string;
            avatar: {
                path: string;
            };
            groupId: TypeGroupId;
        },
    ];
    employeeProgress: [
        {
            createdAt: string;
            gardens: [
                {
                    gardenId: {
                        _id: string;
                        code: string;
                    };
                    quantity: number;
                },
            ];
            groupId: TypeGroupId;
            isDelete: boolean;
            modificationDetails: [];
            updatedAt: string;
            userId: {
                _id: string;
                fullName: string;
                groupId: string;
            };
        },
    ];
    groupProgress: TypeGroupProgress[];
    finishedDate: string;
    followerIds: [
        {
            _id: string;
            fullName: string;
            avatar: {
                path: string;
            };
            groupId: TypeGroupId;
        },
    ];
    isDelete: boolean;
    modificationDetails: [];
    ownerId: string;
    productId: TypeProduct;
    productTypeId: TypeProduct;
    startedDate: string;
    status: string;
    title: string;
    _id: string;
};

type HarvestStore = {
    schedulesHarvest: TypeSchedulesHarvest[];
    schedulesHarvestDetail: TypeDetailScheduleHarvest;
    getListScheduleHarvest: () => Promise<void>;
    getDetailScheduleHarvest: (_id: string) => Promise<void>;
};

export const fixAvatarPath = (path: string) => {
    const updatedPath = path.replace(/\\/g, '/');
    return `${ENV.BACKEND_URL}${updatedPath}`;
};

export const useHarvestStore = create<HarvestStore>(set => ({
    schedulesHarvest: [],
    schedulesHarvestDetail: {
        createdBy: {_id: '', fullName: ''},
        description: '',
        employeeIds: [
            {
                _id: '',
                fullName: '',
                avatar: {
                    path: '',
                },
                groupId: {_id: '', name: '', code: ''},
            },
        ],
        employeeProgress: [
            {
                createdAt: '',
                gardens: [
                    {
                        gardenId: {
                            _id: '',
                            code: '',
                        },
                        quantity: 0,
                    },
                ],
                groupId: {_id: '', name: '', code: ''},
                isDelete: false,
                modificationDetails: [],
                updatedAt: '',
                userId: {
                    _id: '',
                    fullName: '',
                    groupId: '',
                },
            },
        ],
        groupProgress: [],
        finishedDate: '',
        followerIds: [
            {
                _id: '',
                fullName: '',
                avatar: {
                    path: '',
                },
                groupId: {_id: '', name: '', code: ''},
            },
        ],
        isDelete: false,
        modificationDetails: [],
        ownerId: '',
        productId: {_id: '', name: ''},
        productTypeId: {_id: '', name: ''},
        startedDate: '',
        status: '',
        title: '',
        _id: '',
    },

    getListScheduleHarvest: async () => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/harvest/collection`,
            );

            set({schedulesHarvest: response.data?.data || []});
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
                        text: 'Không tải được danh sách quy trình thu hoạch',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },

    getDetailScheduleHarvest: async (_id: string) => {
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/harvest/detail/${_id}`,
            );

            console.log(response.data?.data || {});

            const newschedulesHarvestDetail = {
                ...(response.data?.data || {}),
            };

            if (response.data.data.employeeProgress.length > 0) {
                const groupProgress: TypeGroupProgress[] =
                    response.data.data.employeeProgress.reduce(
                        (
                            acc: TypeGroupProgress[],
                            item: TypeDetailScheduleHarvest['employeeProgress'][number],
                        ) => {
                            const gId = item.groupId._id;

                            // kiểm tra group đã có chưa
                            let group = acc.find(g => g.groupId === gId);

                            if (!group) {
                                group = {
                                    groupId: gId,
                                    name: item.groupId.name,
                                    code: item.groupId.code,
                                    users: [],
                                };
                                acc.push(group!);
                            }

                            // push user vào group
                            group!.users.push({
                                userId: item.userId,
                                gardens: item.gardens,
                            });

                            return acc;
                        },
                        [],
                    );

                newschedulesHarvestDetail.groupProgress = groupProgress;
            }

            set({schedulesHarvestDetail: newschedulesHarvestDetail});
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
                        text: 'Không tải được chi tiết quy trình thu hoạch',
                        duration: Snackbar.LENGTH_LONG,
                    });
                }
            }, 100);
        }
    },
}));
