import SCREEN_INFO from './screenInfo';
import {ScreenRegistry} from './types';

/* screens */
import Main from '../../screens/home/Main';
import Unit from '../../screens/home/Unit';
import Profile from '../../screens/user/Profile';
import Document from '../../screens/home/Document';
import WorkSchedule from '../../screens/home/WorkSchedule';
import DetailDocuments from '../../screens/home/Document/DetailDocuments';
import Statistic from '../../screens/home/Statistic';
import UpdatePassword from '../../screens/user/UpdatePassword';
import Notification from '../../screens/user/Notification';
import ListNotification from '../../screens/home/ListNotification';
import Feedback from '../../screens/onboarding/Feedback';
import Feedback1 from '../../screens/onboarding/Feedback/index2';
import News from '../../screens/user/News';
import News1 from '../../screens/user/News/index1';
import GardenInfo from '../../screens/home/Garden/GardenInfo';
import GardenScan from '@/screens/home/Garden/GardenScan';
import GardenDeclareWorker from '../../screens/home/Garden/GardenDeclareWorker';
import GardenWorker from '@/screens/home/Garden/GardenDetailWorker';
import GardenInfo1 from '../../screens/home/Garden/GardenInfo1';
import Worker from '../../screens/home/Worker';
import WorkerInfo from '../../screens/home/Worker/WorkerInfo';
import ScheduleDetail from '@/screens/home/WorkSchedule/ScheduleDetail';
import GardenInfoWorker from '@/screens/home/Garden/GardenInfoWorker';
import ActiveMachine from '@/screens/home/Garden/ActiveMachine';
import GardenInfoWorker1 from '@/screens/home/Garden/GardenInfoWorker1';
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
        name: SCREEN_INFO.GARDENINFO.key,
        component: GardenInfo,
        options: {
            title: SCREEN_INFO.GARDENINFO.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENINFO1.key,
        component: GardenInfo1,
        options: {
            title: SCREEN_INFO.GARDENINFO1.headerTitle,
        },
    },
    //khu vườn cho worker
    {
        name: SCREEN_INFO.ACTIVEMACHINE.key,
        component: ActiveMachine,
        options: {
            title: SCREEN_INFO.ACTIVEMACHINE.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENINFOWORKER.key,
        component: GardenInfoWorker,
        options: {
            title: SCREEN_INFO.GARDENINFOWORKER.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENINFOWORKER1.key,
        component: GardenInfoWorker1,
        options: {
            title: SCREEN_INFO.GARDENINFOWORKER1.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENWORKER.key,
        component: GardenWorker,
        options: {
            title: SCREEN_INFO.GARDENWORKER.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENDECLAREWORKER.key,
        component: GardenDeclareWorker,
        options: {
            title: SCREEN_INFO.GARDENDECLAREWORKER.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.GARDENCAMERASCAN.key,
        component: GardenScan,
        options: {
            title: SCREEN_INFO.GARDENCAMERASCAN.headerTitle,
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
        name: SCREEN_INFO.STATISTIC.key,
        component: Statistic,
        options: {
            title: SCREEN_INFO.STATISTIC.headerTitle,
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
