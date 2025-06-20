import React, {useState, useEffect} from 'react';

/* configurations */
import asyncStorageHelper from './src/utils/localStorageHelper/index';
import {useAuthStore} from './src/stores/authStore';

/* packages */
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {OneSignal, LogLevel} from 'react-native-onesignal';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';

const InitApp = () => {
    const {autoLogin} = useAuthStore();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            const token = asyncStorageHelper.token;
            if (typeof token === 'string' && token !== '') {
                await autoLogin();

                OneSignal.Debug.setLogLevel(LogLevel.Verbose);
                OneSignal.initialize('64fd0b66-e4fe-431f-b95f-1ef857e1adfd');

                //YÊU CẦU QUYỀN gửi thông báo từ người dùng
                OneSignal.Notifications.requestPermission(true);

                OneSignal.login(token);
            } else {
                OneSignal.logout(); // nếu không có token thì onesignal sẽ không gửi thông báo
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
