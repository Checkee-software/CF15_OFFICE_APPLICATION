import { ScreenName } from './screenName';
import { ScreenInformation } from './types';

import USER_SCREENS from './user';
import HOME_SCREENS from './home';
import SUBSCREENS from './subscreen';
import GLOBAL_SCREENS from './global';
import ONBOARDING_SCREENS from './onboarding';

type Screens = Record<ScreenName, Readonly<ScreenInformation>>;

const SCREEN_INFO: Screens = Object.assign(
    USER_SCREENS,
    HOME_SCREENS,
    GLOBAL_SCREENS,
    SUBSCREENS,
    ONBOARDING_SCREENS,
)

Object.freeze(SCREEN_INFO);

export default SCREEN_INFO;
