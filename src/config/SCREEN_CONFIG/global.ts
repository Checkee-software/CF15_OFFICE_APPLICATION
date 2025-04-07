import { ScreenInformation } from './types';

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
    GAS_TANK_DETAIL: {
        key: 'GAS_TANK_DETAIL',
        headerTitle: 'THÔNG TIN SẢN PHẨM',
        isOpenQRCamera: false,
    } as ScreenInformation,
    SCANNED_GAS_TANK: {
        key: 'SCANNED_GAS_TANK',
        headerTitle: 'CÁC MÃ ĐÃ THAO TÁC',
        isOpenQRCamera: false,
    } as ScreenInformation,
}

export default GLOBAL_SCREENS;
