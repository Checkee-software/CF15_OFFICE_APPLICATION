import { ScreenInformation } from './types';

const ONBOARDING_SCREENS = {
    INDEX: {
        key: 'INDEX',
        isOpenQRCamera: false,
    } as ScreenInformation,
    LOGIN: {
        key: 'LOGIN',
        headerTitle: 'TRA CỨU THỦ CÔNG',
        isOpenQRCamera: false,
    } as ScreenInformation,
    AUTOMATIC_TRACING: {
        key: 'AUTOMATIC_TRACING',
        headerTitle: 'TRUY XUẤT TỰ ĐỘNG',
        isOpenQRCamera: false,
    } as ScreenInformation,
}

export default ONBOARDING_SCREENS;
