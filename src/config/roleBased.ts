import SCREEN_INFO from './SCREEN_CONFIG/screenInfo';

const ROLE_BASED: any = Object.freeze({
    MANAGEMENT: [
        SCREEN_INFO.WAREHOUSE_EXPORT_FILLED_GAS_TANK /* xuất chai thành phẩm */,
        SCREEN_INFO.WAREHOUSE_EXPORT_GAS_TANK /* xuất vỏ */,
        SCREEN_INFO.FULL_CYLINDER_RETURN /* hồi lưu bình đầy */,
        SCREEN_INFO.STATISTIC /* báo cáo thống kê */,
    ],
    DEPARTMENT: [
        SCREEN_INFO.DIRECT_EXPORT_FILLED_GAS_TANK /* xuất bình (thẳng) */,
        SCREEN_INFO.WAREHOUSE_EXPORT_FILLED_GAS_TANK /* xuất bình (kho xe) */,
        SCREEN_INFO.FULL_CYLINDER_RETURN /* hồi lưu bình đầy */,
        SCREEN_INFO.DIRECT_EXPORT_GAS_TANK /* xuất vỏ (thẳng) */,
        SCREEN_INFO.WAREHOUSE_EXPORT_GAS_TANK /* xuất vỏ (kho xe) */,
        SCREEN_INFO.IMPORT_TANK /* nhập vỏ */,
        SCREEN_INFO.UPDATE_EXPIRED_AUDIT,
        SCREEN_INFO.STATISTIC /* báo cáo thống kê */,
    ],
    LEADER: [
        SCREEN_INFO.DIRECT_EXPORT_GAS_TANK,
        SCREEN_INFO.WAREHOUSE_EXPORT_GAS_TANK,
        SCREEN_INFO.STATISTIC /* báo cáo thống kê */,
    ],
    WORKER: [
        SCREEN_INFO.EXPORT_PRODUCT,
        SCREEN_INFO.SELLING,
        SCREEN_INFO.STATISTIC /* báo cáo thống kê */,
    ],
});

export default ROLE_BASED;
