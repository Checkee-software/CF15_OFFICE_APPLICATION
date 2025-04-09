import SCREEN_INFO from './screenInfo';
import {ScreenRegistry} from './types';

/* screens */
import Login from '../../screens/onboarding/Login';
import Splash from '../../screens/onboarding/Splash';
import CameraScanner from '../../screens/global/CameraScanner';
import AutomaticTracing from '../../screens/onboarding/AutomaticTracing';

/**
 * Declare user's screens before signing in
 * For handling route only
 */

export const UNAUTHENTICATION_SCREENS: ScreenRegistry[] = [
    {
        name: SCREEN_INFO.LOGIN.key,
        component: Login,
        options: {
            headerShown: false,
        },
    },
    {
        name: SCREEN_INFO.INDEX.key,
        component: Splash,
        options: {
            headerShown: false,
        },
    },
    {
        name: SCREEN_INFO.CAMERA_SCANNER.key,
        component: CameraScanner,
        options: {
            title: SCREEN_INFO.CAMERA_SCANNER.headerTitle,
        },
    },
    {
        name: SCREEN_INFO.AUTOMATIC_TRACING.key,
        component: AutomaticTracing,
        options: {
            title: SCREEN_INFO.CAMERA_SCANNER.headerTitle,
        },
    },
];

Object.freeze(UNAUTHENTICATION_SCREENS);
