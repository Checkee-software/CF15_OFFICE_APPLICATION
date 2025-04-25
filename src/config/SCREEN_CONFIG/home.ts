import {ScreenInformation} from './types';

const HOME_SCREENS = {
    MAIN: {
        key: 'MAIN',
        headerTitle: 'CF15 OFFICE',
        isOpenQRCamera: false,
    } as ScreenInformation,
    NOTIFICATION: {
        key: 'NOTIFICATION',
        headerTitle: 'THÔNG BÁO',
        isOpenQRCamera: false,
    } as ScreenInformation,
    LISTNOTIFICATION: {
        key: 'LISTNOTIFICATION',
        headerTitle: 'THÔNG BÁO',
        isOpenQRCamera: false,
    } as ScreenInformation,
    DOCUMENT: {
        key: 'DOCUMENT',
        headerTitle: 'TÀI LIỆU',
        isOpenQRCamera: false,
    } as ScreenInformation,
    DETAILDOCUMENTS: {
        key: 'DETAILDOCUMENTS',
        headerTitle: 'CHI TIẾT TÀI LIỆU',
        isOpenQRCamera: false,
    } as ScreenInformation,
    BROWSEJOBS: {
        key: 'BROWSEJOBS',
        headerTitle: 'DUYỆT CÔNG VIỆC',
        isOpenQRCamera: false,
    } as ScreenInformation,
    GARDENINFO: {
        key: 'GARDENINFO',
        headerTitle: 'DANH SÁCH KHU VƯỜN',
        isOpenQRCamera: false,
    } as ScreenInformation,
    GARDENWORKER: {
        key: 'GARDENWORKER',
        headerTitle: 'THÔNG TIN KHU VƯỜN',
        isOpenQRCamera: false,
    } as ScreenInformation,
    GARDENDECLAREWORKER: {
        key: 'GARDENDECLAREWORKER',
        headerTitle: 'KHAI BÁO KHU VƯỜN',
        isOpenQRCamera: false,
    } as ScreenInformation,
    GARDENHISTORY: {
        key: 'GARDENHISTORY',
        headerTitle: 'Lịch sử',
        isOpenQRCamera: false,
    } as ScreenInformation,
    GARDENCAMERASCAN: {
        key: 'GARDENCAMERASCAN',
        headerTitle: 'QUÉT MÃ KHU VƯỜN',
        isOpenQRCamera: false,
    } as ScreenInformation,
    GARDENINFO1: {
        key: 'GARDENINFO1',
        headerTitle: 'CHI TIẾT KHU VƯỜN',
        isOpenQRCamera: false,
    } as ScreenInformation,
    WORKER: {
        key: 'WORKER',
        headerTitle: 'DANH SÁCH NHÂN SỰ',
        isOpenQRCamera: false,
    } as ScreenInformation,
    WORKERINFO: {
        key: 'WORKERINFO',
        headerTitle: 'THÔNG TIN NGƯỜI LAO ĐỘNG',
        isOpenQRCamera: false,
    } as ScreenInformation,
    WORKSCHEDULE: {
        key: 'WORKSCHEDULE',
        headerTitle: 'LỊCH LÀM VIỆC',
        isOpenQRCamera: false,
    } as ScreenInformation,
    SCHEDULEDETAIL: {
        key: 'SCHEDULEDETAIL',
        headerTitle: 'CHI TIẾT LỊCH LÀM VIỆC',
        isOpenQRCamera: false,
    } as ScreenInformation,
    UNIT: {
        key: 'UNIT',
        headerTitle: 'ĐƠN VỊ',
        isOpenQRCamera: false,
    } as ScreenInformation,
    STATISTIC: {
        key: 'STATISTIC',
        headerTitle: 'BÁO CÁO THỐNG KÊ',
        isOpenQRCamera: false,
    } as ScreenInformation,
    DIRECT_EXPORT_FILLED_GAS_TANK: {
        key: 'DIRECT_EXPORT_FILLED_GAS_TANK',
        headerTitle: 'Xuất bình (thẳng)',
        buttonLabel: 'Xuất bình (thẳng)',
        isOpenQRCamera: false,
    } as ScreenInformation,
    WAREHOUSE_EXPORT_FILLED_GAS_TANK: {
        key: 'WAREHOUSE_EXPORT_FILLED_GAS_TANK',
        headerTitle: 'Xuất bình (kho xe)',
        buttonLabel: 'Xuất bình (kho xe)',
        isOpenQRCamera: false,
    } as ScreenInformation,
    DIRECT_EXPORT_GAS_TANK: {
        key: 'DIRECT_EXPORT_GAS_TANK',
        headerTitle: 'Xuất vỏ (thẳng)',
        buttonLabel: 'Xuất vỏ (thẳng)',
        isOpenQRCamera: false,
    } as ScreenInformation,
    WAREHOUSE_EXPORT_GAS_TANK: {
        key: 'WAREHOUSE_EXPORT_GAS_TANK',
        headerTitle: 'Xuất vỏ (kho xe)',
        buttonLabel: 'Xuất vỏ (thẳng)',
        isOpenQRCamera: false,
    } as ScreenInformation,
    FULL_CYLINDER_RETURN: {
        key: 'FULL_CYLINDER_RETURN',
        headerTitle: 'Hồi lưu bình đầy',
        buttonLabel: 'Hồi lưu bình đầy',
        isOpenQRCamera: false,
    } as ScreenInformation,
    IMPORT_TANK: {
        key: 'IMPORT_TANK',
        headerTitle: 'Nhập vỏ',
        buttonLabel: 'Nhập vỏ',
        isOpenQRCamera: false,
    } as ScreenInformation,
    UPDATE_EXPIRED_AUDIT: {
        key: 'UPDATE_EXPIRED_AUDIT',
        headerTitle: 'Cập nhật hạn kiểm định',
        buttonLabel: 'Cập nhật hạn kiểm định',
        isOpenQRCamera: false,
    } as ScreenInformation,
    EXPORT_PRODUCT: {
        key: 'EXPORT_PRODUCT',
        headerTitle: 'XUẤT HÀNG',
        buttonLabel: 'XUẤT HÀNG',
        isOpenQRCamera: false,
    } as ScreenInformation,
    SELLING: {
        key: 'SELLING',
        headerTitle: 'Bán hàng',
        buttonLabel: 'Bán hàng',
        isOpenQRCamera: false,
    } as ScreenInformation,
};

export default HOME_SCREENS;
