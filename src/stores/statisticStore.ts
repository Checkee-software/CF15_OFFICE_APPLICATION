import ENV from '@/config/ENV';
import {IStatisticFormData} from '@/shared-types/form-data/StatisticFormData/StatisticFormData';
import {IWorkList} from '@/shared-types/Response/StatisticResponse/StatisticResponse';
import axiosClient from '@/utils/axiosClient';
import moment from 'moment';
import Snackbar from 'react-native-snackbar';
import {create} from 'zustand';

interface IStatisticResponse {
    totalCost: number;
    totalGroup: number;
    totalMember: number;
    totalGarden: number;
    totalWork?: string;
    totalProduct?: number;
    list: IWorkList[];
    chart: IChartData[];
}

interface IListSelection {
    _id: string;
    name: string;
}

type StatisticStore = {
    statisticData: IStatisticResponse | null;
    listSelection: IListSelection[];
    isLoading: boolean;
    getStatistic: (data: IStatisticFormData) => Promise<void>;
    getStatisticForWorker: (data: IStatisticFormData) => Promise<void>;
    getListSelection: (selection: string) => Promise<void>;
    getGroupName: (groupId: string) => Promise<void>;
    clearStatisticData: () => void;
    clearListSelection: () => void;
    convertToChartData: (data: any[]) => void;
};

type IChartData = {
    value: number;
    frontColor: string;
    label?: string;
    spacing?: number;
    _realValue: number;
};

const convertToChartData = (data: any[]): IChartData[] => {
    const result: IChartData[] = [];

    const allValues = data.flatMap(item => [
        item.labourCost ?? 0,
        item.materialCost ?? 0,
        item.machineCost ?? 0,
    ]);
    const maxRealValue = Math.max(...allValues, 1);

    data.forEach(item => {
        const pushColumn = (
            realValue: number,
            color: string,
            label?: string,
        ) => {
            let scaledValue;
            if (realValue === 0) {
                scaledValue = 5; // ép một chiều cao nhỏ để vẫn hiển thị
            } else {
                scaledValue = Math.max((realValue / maxRealValue) * 100, 5);
            }

            result.push({
                value: scaledValue,
                _realValue: realValue,
                frontColor: color,
                label,
            });
        };

        pushColumn(item.labourCost ?? 0, '#FF4C4C', item.label);
        pushColumn(item.materialCost ?? 0, '#4CAF50');
        pushColumn(item.machineCost ?? 0, '#2196F3');

        result.push({
            value: 0,
            spacing: 70,
            frontColor: 'transparent',
            _realValue: 0,
        });
    });

    return result;
};

const convertToPieData = (data: any) => {
    const COLORS = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#66BB6A',
        '#EF5350',
        '#29B6F6',
        '#AB47BC',
        '#FFA726',
        '#8D6E63',
    ];

    const pieData = data.map((item: any, index: any) => ({
        value: item.percentage,
        text: `${item.percentage}%`,
        color: COLORS[index % COLORS.length],
        label: item.taskName,
        processingRate: item.processingRate,
        totalSquare: item.totalSquare,
    }));

    return pieData;
};

export const useStatisticStore = create<StatisticStore>(set => ({
    statisticData: null,
    listSelection: [],
    isLoading: false,

    getStatistic: async ({
        type,
        targetId,
        startDate,
        endDate,
    }: IStatisticFormData) => {
        const formattedStartDate = moment(startDate).toISOString();
        const formattedEndDate = moment(endDate).toISOString();
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/statistics/?type=${type}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&targetId=${targetId}`,
            );
            if (response.data.data) {
                const mainStatisticData = {
                    list: [...response.data.data.list],
                    totalCost: response.data.data.totalCost,
                    totalGarden: response.data.data.totalGarden,
                    totalGroup: response.data.data.totalGroup,
                    totalMember: response.data.data.totalMember,
                    totalWork: response.data.data.totalWork,
                    chart: convertToChartData(response.data.data.chart || []),
                };
                set({statisticData: mainStatisticData});
                set({isLoading: false});
            } else {
                set({isLoading: false});
            }
        } catch (error: any) {
            console.log(error);
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

    getStatisticForWorker: async ({
        type,
        targetId,
        startDate,
        endDate,
    }: IStatisticFormData) => {
        const formattedStartDate = moment(startDate).toISOString();
        const formattedEndDate = moment(endDate).toISOString();
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/statistics/?type=${type}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&targetId=${targetId}`,
            );
            if (response.data.data) {
                const mainStatisticData = {
                    //list: [...response.data.data.list],
                    //totalCost: response.data.data.totalCost,
                    //totalGarden: response.data.data.totalGarden,
                    //totalGroup: response.data.data.totalGroup,
                    //totalMember: response.data.data.totalMember,
                    //totalWork: response.data.data.totalWork,
                    chart: convertToPieData(response.data.data || []),
                };
                set({statisticData: mainStatisticData});
                set({isLoading: false});
            } else {
                set({isLoading: false});
            }

            set({isLoading: false});
        } catch (error: any) {
            console.log(error);
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

    getListSelection: async (selection: string) => {
        set({isLoading: true});
        try {
            const response =
                selection === 'WORK'
                    ? await axiosClient.get(
                          `${ENV.BACKEND_URL}/resources/schedules/selection-schedule`,
                      )
                    : selection === 'PRODUCT'
                    ? await axiosClient.get(
                          `${ENV.BACKEND_URL}/resources/products/selection`,
                      )
                    : await axiosClient.get(
                          `${ENV.BACKEND_URL}/resources/units/selection`,
                      );

            if (response.data.data) {
                const selections = response.data.data.map((item: any) => ({
                    _id: item._id,
                    name: item.name,
                }));

                const selectionAll = {
                    _id: '',
                    name: 'Tất cả',
                };

                selections.unshift(selectionAll);

                set({listSelection: selections});
                set({isLoading: false});
            }
        } catch (error: any) {
            console.log(error);
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

    getGroupName: async (groupId: string) => {
        set({isLoading: true});
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/units/selection`,
            );

            if (response.data.data) {
                const findGroup = response.data.data.filter(
                    (item: any) => item._id === groupId,
                );

                set({listSelection: findGroup});
                set({isLoading: false});
            }
        } catch (error: any) {
            console.log(error);
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

    clearStatisticData: () => set({statisticData: null}),
    clearListSelection: () => set({listSelection: []}),
    convertToChartData: (data: any[]) => convertToChartData(data),
}));
