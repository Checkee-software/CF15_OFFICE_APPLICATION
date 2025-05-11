import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';

const backendURL = 'http://cf15officeservice.checkee.vn';

interface IGardenWorkList {
    gardenName: string;
    gardenId: string;
    doingAt: string;
    doingBy: string;
    workName: string;
    materialName: string;
    processesValue: string;
    statusBrowse: string;
    dateBrowse: string;
    reason: string;
}

interface gardenWorkStore {
    isLoading: boolean;
    listGardenWork: IGardenWorkList[];
    listGardenWorkFilter: IGardenWorkList[];
    badgeGardenWorkUnBrowse: number;
    //getListWorkSchedule: () => Promise<void>;
    filterByStatus: (status: string) => void;
    resetData: () => void;
    setBrowsed: () => void;
    setBadgeUnBrowse: (newList: []) => void;
}

export const useGardenWorkStore = create<gardenWorkStore>(set => ({
    isLoading: false,
    badgeGardenWorkUnBrowse: 0,
    listGardenWork: [
        {
            gardenName: 'Khu vườn CF-A4',
            gardenId: '009831234578232',
            doingAt: '15:00 19/04/2025',
            doingBy: 'Lê Thị Hoài An',
            workName: 'Bón phân',
            materialName: 'Phân kali',
            processesValue: '1.5/lít',
            statusBrowse: 'PENDING',
            dateBrowse: '',
            reason: '',
        },
        {
            gardenName: 'Khu vườn CF-A5',
            gardenId: '009831234578233',
            doingAt: '15:00 24/05/2025',
            doingBy: 'Lê Văn B',
            workName: 'Đào hố',
            materialName: 'Xẻng và cát',
            processesValue: '3.5/lít',
            statusBrowse: 'PENDING',
            dateBrowse: '',
            reason: '',
        },
        {
            gardenName: 'Khu vườn CF-A5',
            gardenId: '009831234578234',
            doingAt: '15:00 12/05/2025',
            doingBy: 'Barcelona FC',
            workName: 'Tưới cỏ sân bóng và đá bóng',
            materialName: 'Trái bóng và sân cỏ',
            processesValue: '5.5/lít',
            statusBrowse: 'PENDING',
            dateBrowse: '',
            reason: '',
        },
    ],

    listGardenWorkFilter: [
        {
            gardenName: 'Khu vườn CF-A4',
            gardenId: '009831234578232',
            doingAt: '15:00 19/04/2025',
            doingBy: 'Lê Thị Hoài An',
            workName: 'Bón phân',
            materialName: 'Phân kali',
            processesValue: '1.5/lít',
            statusBrowse: 'PENDING',
            dateBrowse: '',
            reason: '',
        },
        {
            gardenName: 'Khu vườn CF-A5',
            gardenId: '009831234578233',
            doingAt: '15:00 24/05/2025',
            doingBy: 'Lê Văn B',
            workName: 'Đào hố',
            materialName: 'Xẻng và cát',
            processesValue: '3.5/lít',
            statusBrowse: 'PENDING',
            dateBrowse: '',
            reason: '',
        },
        {
            gardenName: 'Khu vườn CF-A5',
            gardenId: '009831234578234',
            doingAt: '15:00 12/05/2025',
            doingBy: 'Barcelona FC',
            workName: 'Tưới cỏ sân bóng và đá bóng',
            materialName: 'Trái bóng và sân cỏ',
            processesValue: '5.5/lít',
            statusBrowse: 'PENDING',
            dateBrowse: '',
            reason: '',
        },
    ],

    filterByStatus: status =>
        set(state => ({
            listGardenWorkFilter: state.listGardenWork.filter(
                item => item.statusBrowse === status,
            ),
        })),

    setBadgeUnBrowse: () =>
        set(state => ({
            badgeGardenWorkUnBrowse: state.listGardenWork.filter(
                item => item.statusBrowse === 'PENDING',
            ).length,
        })),

    setBrowsed: (newList: []) =>
        set(state => ({
            listGardenWorkFilter: newList,
            listGardenWork: newList,
            badgeGardenWorkUnBrowse: newList.filter(
                item => item.statusBrowse === 'PENDING',
            ).length,
        })),

    resetData: () =>
        set(state => ({listGardenWorkFilter: state.listGardenWork})),
}));
