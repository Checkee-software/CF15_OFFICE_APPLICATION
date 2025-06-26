import {ScreenInformation} from './types';

const GLOBAL_SCREENS = {
    CAMERA_SCANNER: {
        key: 'CAMERA_SCANNER',
        headerTitle: 'QUÉT MÃ ĐỊNH DANH',
        buttonLabel: 'TRUY XUẤT THÔNG TIN',
        isOpenQRCamera: true,
    } as ScreenInformation,
    MANUAL_SEARCHING: {
        key: 'MANUAL_SEARCHING',
        headerTitle: 'TRA CỨU THỦ CÔNG',
        isOpenQRCamera: false,
    } as ScreenInformation,
};

export default GLOBAL_SCREENS;
