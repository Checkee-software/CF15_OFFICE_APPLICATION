import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {
    THarvestHistory,
    TCollection,
    IHavestHistory,
} from '@/shared-types/Response/HarvestHistoryResponse/HarvestHistoryResponse';
import ENV from '@/config/ENV';
import asyncStorageHelper from '../utils/localStorageHelper/index';
import {
    IArea,
    ILocation,
    IManagement,
    ISidePlant,
    ITotalProductByYear,
} from '@/shared-types/Response/GardenResponse/GardenResponse';

export interface IGarden {
    _id: string /* Id khu vườn */;
    groupId: string /* Id nhom khu vồn */;
    name: string /* Tên khu vườn */;
    code: string /* Mã khu vườn */;
    area: IArea /* Diện tích thực khu vườn */;
    location: ILocation /* Vị trí khu vườn */;
    management: IManagement /* Ban quản lý khu vườn */;
    productId: string /* Id sản phẩm/cây trồng */;
    productTypeId: string /* Id loại sản phẩm/cây trồng */;
    productQuantity: number /* Số lượng sản phẩm/cây trồng */;
    totalProductByYear: ITotalProductByYear[] /* Số cây trồng theo năm */;
    isSidePlant: boolean /* Có cây trồng xen không? */;
    sidePlants: ISidePlant[] /* Danh sách cây trồng xen */;
    lifeEnd: Date /* Vòng đời kết thúc */;
    currentLife: number /* Vòng đời hiện tại */;
    isHarvest: boolean /* Có đang thu hoạch không */;
    currentHarvestId: string /* Id thu hoạch hiện tại */;
    createdAt?: Date;
    gardenNickname?: string;
    note: string;
}

type GardenState = {
    gardens: IGarden[] | [];
    gardenDetail: IGarden | null;
    selectedGarden: IGarden | null;
    isLoading: boolean;
    isLoading2: boolean;
    fetchGardens: (userId: string) => Promise<void>;
    fetchGardenDetail: (id: string) => Promise<void>;
    searchGardens: (id: string, userId: string) => Promise<void>;
    postHarvestStatus: (
        _id: string,
        status: '0' | '1',
        harvestId?: string,
    ) => Promise<void>;
    postHarvestReport: (_id: string, amount: number) => Promise<void>;
    harvestHistory: IHavestHistory[];
    fetchHarvestHistory: (_id: string) => Promise<void>;
    fetchHarvestCollection: (_id: string) => Promise<void>;
    setGardenData: (newGardens: any) => void;
    filterGarden: (params: {
        groupId?: string;
        productId?: string;
        searchValue?: string;
        productTypeId?: string;
    }) => Promise<void>;
    plantsGarden: {_id: string; name: string}[];
    getPlantGarden: (typeId: string) => Promise<void>;
};

const useGardenStore = create<GardenState>(set => ({
    gardens: [],
    gardenDetail: null,
    selectedGarden: null,
    isLoading: false,
    isLoading2: false,
    harvestHistory: [],
    plantsGarden: [],

    fetchGardens: async (userId: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/gardens/collection`,
            );
            console.log(res);

            if (res.data.data.length !== 0) {
                const userGardenNickname =
                    asyncStorageHelper.userGardenNickname;

                const user = userGardenNickname.find(u => u.userId === userId);
                const newGardenNickname = res.data.data?.map((item: any) => {
                    let gardenNickname = '';

                    if (user) {
                        const matchedGarden = user.garden.find(
                            g => g.gardenId === item._id,
                        );
                        if (matchedGarden) {
                            gardenNickname = matchedGarden.gardenNickname;
                        }
                    }

                    // Trả về object gốc + thêm gardenNickname
                    return {
                        ...item,
                        gardenNickname,
                    };
                });

                set({gardens: newGardenNickname});
            } else {
                set({gardens: []});
            }
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể tải danh sách khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchGardenDetail: async (id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/gardens/detail/${id}`,
            );
            console.log(res);
            set({selectedGarden: res.data?.data || null});
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể tải chi tiết khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    searchGardens: async (code: string, userId: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/gardens/find?code=${code}`,
            );
            console.log(res);

            const userGardenNickname = asyncStorageHelper.userGardenNickname;
            const user = userGardenNickname.find(u => u.userId === userId);
            const findGarden = user?.garden.find(
                garden => garden.gardenId === res.data.data._id,
            );

            const newDetailGardenNickname = {
                ...res.data.data,
                gardenNickname: findGarden?.gardenNickname,
            };

            set({gardenDetail: newDetailGardenNickname || null});
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể tìm thấy khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
            set({gardens: []});
        } finally {
            set({isLoading: false});
        }
    },

    postHarvestStatus: async (
        _id: string,
        status: '0' | '1',
        harvestId?: string,
    ) => {
        set({isLoading: true});
        try {
            let url = `${ENV.BACKEND_URL}/resources/gardens/harvest?_id=${_id}&status=${status}`;
            if (status === '0' && harvestId) {
                url += `&harvestId=${harvestId}`;
            }
            const res = await axiosClient.post(url);

            Snackbar.show({
                text: 'Cập nhật trạng thái thu hoạch thành công',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể cập nhật trạng thái thu hoạch',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    postHarvestReport: async (_id: string, amount: number) => {
        set({isLoading: true});
        try {
            const url = `${ENV.BACKEND_URL}/resources/gardens/harvest/report/${_id}/${amount}`;
            const res = await axiosClient.post(url);
            console.log(res);

            Snackbar.show({
                text: 'Báo cáo thu hoạch thành công',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể báo cáo thu hoạch',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchHarvestHistory: async (_id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get<THarvestHistory>(
                `${ENV.BACKEND_URL}/resources/gardens/harvest/history?_id=${_id}`,
            );
            console.log(res);
            set({harvestHistory: res.data?.data || []});
        } catch (error: any) {
            set({harvestHistory: []});
        } finally {
            set({isLoading: false});
        }
    },

    fetchHarvestCollection: async (_id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get<TCollection>(
                `${ENV.BACKEND_URL}/resources/gardens/harvest/collection?_id=${_id}`,
            );
            set({harvestHistory: res.data?.data || []});
        } catch (error: any) {
            // Snackbar.show({
            //     text: 'Không thể tải lịch sử thu hoạch',
            //     duration: Snackbar.LENGTH_SHORT,
            // });
        } finally {
            set({isLoading: false});
        }
    },

    setGardenData: (newGardens: any) => {
        set({isLoading2: true});
        set({gardens: newGardens});
        setTimeout(() => {
            set({isLoading2: false});
        }, 500);
        setTimeout(() => {
            Snackbar.show({
                text: 'Đổi tên khu vườn thành công',
                duration: Snackbar.LENGTH_SHORT,
            });
        }, 600);
    },

    filterGarden: async ({
        groupId,
        productId,
        searchValue = '',
        productTypeId,
    }: {
        productId?: string;
        groupId?: string;
        searchValue?: string;
        productTypeId?: string;
    }) => {
        try {
            const queryParams = new URLSearchParams();
            if (groupId) queryParams.append('groupId', groupId);
            if (productId) queryParams.append('productId', productId);
            if (searchValue) queryParams.append('searchValue', searchValue);
            if (productTypeId)
                queryParams.append('productTypeId', productTypeId);

            const res = await axiosClient.get(
                `${
                    ENV.BACKEND_URL
                }/resources/gardens/list?${queryParams.toString()}`,
            );
            console.log(res);

            if (res.data?.data?.length > 0) {
                set({gardens: res.data.data});
            } else {
                set({gardens: []});
                Snackbar.show({
                    text: 'Không tìm thấy khu vườn phù hợp',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể lọc danh sách khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
            set({gardens: []});
        }
    },

    getPlantGarden: async (typeId?: string) => {
        if (!typeId) return;
        set({isLoading2: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/products/selection-with-type/${typeId}`,
            );
            set({plantsGarden: res?.data?.data || []});
        } catch (error: any) {
            Snackbar.show({
                text: 'Không thể tải danh sách cây trồng',
                duration: Snackbar.LENGTH_SHORT,
            });
            set({plantsGarden: []});
        } finally {
            set({isLoading2: false});
        }
    },
}));

export default useGardenStore;
