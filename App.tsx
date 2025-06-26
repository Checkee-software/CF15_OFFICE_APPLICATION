import React, {useState, useEffect} from 'react';

/* configurations */
import asyncStorageHelper from './src/utils/localStorageHelper/index';
import {useAuthStore} from './src/stores/authStore';

/* packages */
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { OneSignal, LogLevel } from 'react-native-onesignal';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';

const InitApp = () => {
    const {autoLogin} = useAuthStore();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            OneSignal.Debug.setLogLevel(LogLevel.Verbose);
            OneSignal.initialize('69a6acdf-b649-4589-a9b8-88aaa525fa45');

            OneSignal.Notifications.requestPermission(true);

            const token = asyncStorageHelper.token;
            if (typeof token === 'string' && token !== '') {
                await autoLogin();

                OneSignal.login(token);
                console.log('ID: ', await OneSignal.User.getOnesignalId());
            } else {
                // OneSignal.logout(); // nếu không có token thì onesignal sẽ không gửi thông báo
            }
            setIsReady(true);
        };

        init();
        // eslint-disable-next-line
    }, []);

    if (!isReady) {
        return <Loading />;
    }

    return <Router />;
};

export default function App() {
    // if (asyncStorageHelper.isLoad) {
    //     return <Loading />;
    // } else {
    //     return (
    //         <SafeAreaProvider>
    //             <Router />
    //         </SafeAreaProvider>
    //     );
    // }
    return (
        <SafeAreaProvider>
            <InitApp />
        </SafeAreaProvider>
    );
}
