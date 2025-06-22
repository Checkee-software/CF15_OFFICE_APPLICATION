/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';

/* configurations */
import asyncStorageHelper from './src/utils/localStorageHelper/index';
import {useAuthStore} from './src/stores/authStore';

/* packages */
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {OneSignal} from 'react-native-onesignal';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';

const InitApp = () => {
    const {autoLogin, setRedirectData} = useAuthStore();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // gắn sự kiện khi người dùng nhấn vào thông báo
        const handleNotificationClick = (event: any) => {
            const data = event.notification.additionalData;

            if (data?._id !== '') {
                setRedirectData(data._id);
            }
        };

        OneSignal.Notifications.addEventListener(
            'click',
            handleNotificationClick,
        );

        // clean khi component unmount
        return () => {
            OneSignal.Notifications.removeEventListener(
                'click',
                handleNotificationClick,
            );
        };
    }, []);

    useEffect(() => {
        const init = async () => {
            const token = asyncStorageHelper.token;

            if (token !== '') {
                await autoLogin();
            }

            setIsReady(true);
        };

        init();
    }, []);

    if (!isReady) {
        return <Loading />;
    }

    return <Router />;
};

export default function App() {
    return (
        <SafeAreaProvider>
            <InitApp />
        </SafeAreaProvider>
    );
}
