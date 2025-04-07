import { ScreenInformation } from './types';

const USER_SCREENS = {
    PROFILE: {
        key: 'PROFILE',
        headerTitle: 'HỒ SƠ',
        buttonLabel: 'Xem hồ sơ',
        isOpenQRCamera: false,
    } as ScreenInformation,
    UPDATE_PASSWORD: {
        key: 'UPDATE_PASSWORD',
        headerTitle: 'ĐỔI MẬT KHẢU',
        buttonLabel: 'ĐỔI MẬT KHẨU',
        isOpenQRCamera: false,
    } as ScreenInformation,
}

export default USER_SCREENS;
