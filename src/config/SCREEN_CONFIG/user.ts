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
        headerTitle: 'ĐỔI MẬT KHẨU',
        buttonLabel: 'ĐỔI MẬT KHẨU',
        isOpenQRCamera: false,
    } as ScreenInformation,
    NOTIFICATION: {
        key: 'NOTIFICATION',
        headerTitle: 'QUẢN LÝ THÔNG BÁO',
        buttonLabel: 'QUẢN LÝ THÔNG BÁO',
        isOpenQRCamera: false,
    } as ScreenInformation,
    FEEDBACK: {
        key: 'FEEDBACK',
        headerTitle: 'GÓP Ý',
        buttonLabel: 'GÓP Ý',
        isOpenQRCamera: false,
    } as ScreenInformation,
    FEEDBACK1: {
        key: 'FEEDBACK1',
        headerTitle: 'GÓP Ý',
        buttonLabel: 'GÓP Ý',
        isOpenQRCamera: false,
    } as ScreenInformation,
}

export default USER_SCREENS;
