import SCREEN_INFO from './screenInfo';
import {ScreenRegistry} from './types';

/* screens */
import Main from '../../screens/home/Main';
import Unit from '@/screens/home/unit';
import Profile from '../../screens/user/Profile';
import Document from '../../screens/home/Document';
import WorkSchedule from '../../screens/home/WorkSchedule';
import DetailDocuments from '../../screens/home/Document/DetailDocuments';
import Statistic from '../../screens/home/Statistic';
import BrowseJobs from '../../screens/home/BrowseJobs';
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
import ListNotification from '../../screens/home/ListNotification';
import Feedback from '../../screens/onboarding/Feedback';
import Feedback1 from '../../screens/onboarding/Feedback/index2';
import News from '../../screens/user/News';
import News1 from '../../screens/user/News/index1';
import GardenInfo from '../../screens/home/Garden/GardenInfo';
import GardenDeclare from '../../screens/home/Garden/GardenDeclare';
import GardenInfo1 from '../../screens/home/Garden/GardenInfo1';
import Worker from '../../screens/home/Worker';
import WorkerInfo from '../../screens/home/Worker/WorkerInfo';
import ScheduleDetail from '@/screens/home/WorkSchedule/ScheduleDetail';
/**
 * Declare user's screens before signing in
 * For handling route only
 */

export const AUTHENTICATION_SCREENS: ScreenRegistry[] = [
    {
        name: SCREEN_INFO.NEWS.key,
        component: News,
        options: {
            title: SCREEN_INFO.NEWS.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.NEWS1.key,
        component: News1,
        options: {
            title: SCREEN_INFO.NEWS1.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.MAIN.key,
        component: Main,
        options: {
            title: SCREEN_INFO.MAIN.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.FEEDBACK.key,
        component: Feedback,
        options: {
            title: SCREEN_INFO.FEEDBACK.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.FEEDBACK1.key,
        component: Feedback1,
        options: {
            title: SCREEN_INFO.FEEDBACK1.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.BROWSEJOBS.key,
        component: BrowseJobs,
        options: {
            title: SCREEN_INFO.BROWSEJOBS.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENINFO.key,
        component: GardenInfo,
        options: {
            title: SCREEN_INFO.GARDENINFO.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENDECLARE.key,
        component: GardenDeclare,
        options: {
            title: SCREEN_INFO.GARDENDECLARE.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENINFO1.key,
        component: GardenInfo1,
        options: {
            title: SCREEN_INFO.GARDENINFO1.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.WORKER.key,
        component: Worker,
        options: {
            title: SCREEN_INFO.WORKER.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.WORKERINFO.key,
        component: WorkerInfo,
        options: {
            title: SCREEN_INFO.WORKERINFO.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.WORKSCHEDULE.key,
        component: WorkSchedule,
        options: {
            title: SCREEN_INFO.WORKSCHEDULE.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.SCHEDULEDETAIL.key,
        component: ScheduleDetail,
        options: {
            title: SCREEN_INFO.SCHEDULEDETAIL.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.UNIT.key,
        component: Unit,
        options: {
            title: SCREEN_INFO.UNIT.headerTitle,
        },
    },
    /* HOME */
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
    {
        name: SCREEN_INFO.PROFILE.key,
        component: Profile,
        options: {
            title: SCREEN_INFO.PROFILE.headerTitle,
        },
    },
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
    {
        name: SCREEN_INFO.LISTNOTIFICATION.key,
        component: ListNotification,
        options: {
            title: SCREEN_INFO.NOTIFICATION.headerTitle,
        },
    },
    /* DOCUMENT */
    {
        name: SCREEN_INFO.DOCUMENT.key,
        component: Document,
        options: {
            title: SCREEN_INFO.DOCUMENT.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.DETAILDOCUMENTS.key,
        component: DetailDocuments,
        options: {
            title: SCREEN_INFO.DETAILDOCUMENTS.headerTitle,
        },
    },
];

Object.freeze(AUTHENTICATION_SCREENS);

Object.freeze(AUTHENTICATION_SCREENS);
