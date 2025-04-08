import SCREEN_INFO from './screenInfo';
import { ScreenRegistry } from './types';

/* screens */
import Main from '../../screens/home/Main';
import Profile from '../../screens/user/Profile';
import Statistic from '../../screens/home/Statistic';
import ImportTank from '../../screens/home/ImportTank';
import ExportProduct from '../../screens/home/ExportProduct';
import GasTankDetail from '../../screens/global/GasTankDetail';
import UpdatePassword from '../../screens/user/UpdatePassword';
import CameraScanner from '../../screens/global/CameraScanner';
import ManualSearching from '../../screens/global/ManualSearching';
import ScannedGasTanks from '../../screens/global/ScannedGasTanks';
import FullCylinderReturn from '../../screens/home/FullCylinderReturn';
import UpdateExpiredAudit from '../../screens/home/UpdateExpiredAudit';
import DirectExportGasTank from '../../screens/home/DirectExportGasTank';
import WarehouseExportGasTank from '../../screens/home/WarehouseExportGasTank';
import DirectExportFilledGasTank from '../../screens/home/DirectExportFilledGasTank';
import WarehouseExportFilledGasTank from '../../screens/home/WarehouseExportFilledGasTank';
import Selling from '../../screens/Selling';
import Notification from '../../screens/user/Notification';

/**
 * Declare user's screens before signing in
 * For handling route only
 */

export const AUTHENTICATION_SCREENS: ScreenRegistry[] = [
    {
        name: SCREEN_INFO.PROFILE.key,
        component: Profile,
        options: {
            title: SCREEN_INFO.PROFILE.headerTitle,
        },
    },
    /* HOME */
    {
        name: SCREEN_INFO.MAIN.key,
        component: Main,
        options: {
            title: SCREEN_INFO.MAIN.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.DIRECT_EXPORT_FILLED_GAS_TANK.key,
        component: DirectExportFilledGasTank,
        options: {
            title: SCREEN_INFO.DIRECT_EXPORT_FILLED_GAS_TANK.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.DIRECT_EXPORT_GAS_TANK.key,
        component: DirectExportGasTank,
        options: {
            title: SCREEN_INFO.DIRECT_EXPORT_GAS_TANK.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.FULL_CYLINDER_RETURN.key,
        component: FullCylinderReturn,
        options: {
            title: SCREEN_INFO.FULL_CYLINDER_RETURN.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.STATISTIC.key,
        component: Statistic,
        options: {
            title: SCREEN_INFO.STATISTIC.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.IMPORT_TANK.key,
        component: ImportTank,
        options: {
            title: SCREEN_INFO.IMPORT_TANK.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.UPDATE_EXPIRED_AUDIT.key,
        component: UpdateExpiredAudit,
        options: {
            title: SCREEN_INFO.UPDATE_EXPIRED_AUDIT.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.WAREHOUSE_EXPORT_FILLED_GAS_TANK.key,
        component: WarehouseExportFilledGasTank,
        options: {
            title: SCREEN_INFO.WAREHOUSE_EXPORT_FILLED_GAS_TANK.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.WAREHOUSE_EXPORT_GAS_TANK.key,
        component: WarehouseExportGasTank,
        options: {
            title: SCREEN_INFO.WAREHOUSE_EXPORT_GAS_TANK.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.EXPORT_PRODUCT.key,
        component: ExportProduct,
        options: {
            title: SCREEN_INFO.EXPORT_PRODUCT.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.SELLING.key,
        component: Selling,
        options: {
            title: SCREEN_INFO.SELLING.headerTitle,
        },
    },
    /* GLOBAL */
    {
        name: SCREEN_INFO.GAS_TANK_DETAIL.key,
        component: GasTankDetail,
        options: {
            title: SCREEN_INFO.GAS_TANK_DETAIL.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.MANUAL_SEARCHING.key,
        component: ManualSearching,
        options: {
            title: SCREEN_INFO.MANUAL_SEARCHING.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.SCANNED_GAS_TANK.key,
        component: ScannedGasTanks,
        options: {
            title: SCREEN_INFO.SCANNED_GAS_TANK.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.CAMERA_SCANNER.key,
        component: CameraScanner,
        options: {
            title: SCREEN_INFO.CAMERA_SCANNER.headerTitle,
        },
    },
    /* USER */
    // {
    //     name: SCREEN_INFO.PROFILE.key,
    //     component: Profile,
    //     options: {
    //         title: SCREEN_INFO.PROFILE.headerTitle,
    //     },
    // },
    {
        name: SCREEN_INFO.UPDATE_PASSWORD.key,
        component: UpdatePassword,
        options: {
            title: SCREEN_INFO.UPDATE_PASSWORD.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.NOTIFICATION.key,
        component: Notification,
        options: {
            title: SCREEN_INFO.NOTIFICATION.headerTitle,
        },
    },
];

Object.freeze(AUTHENTICATION_SCREENS);
