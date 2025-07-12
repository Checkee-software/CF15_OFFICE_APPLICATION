/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';

/* configurations */
import asyncStorageHelper from './src/utils/localStorageHelper/index';
import {useAuthStore} from './src/stores/authStore';

/* packages */
import {SafeAreaView} from 'react-native-safe-area-context';
import {OneSignal, LogLevel} from 'react-native-onesignal';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';

const InitApp = () => {
    const {autoLogin, setRedirectData} = useAuthStore();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            OneSignal.Debug.setLogLevel(LogLevel.Verbose);
            OneSignal.initialize('69a6acdf-b649-4589-a9b8-88aaa525fa45');

            OneSignal.Notifications.requestPermission(true);

            const token = asyncStorageHelper.token;

            if (token !== '') {
                await autoLogin();
            }

            setIsReady(true);
        };

        init();
    }, []);

    useEffect(() => {
        // gắn sự kiện khi người dùng nhấn vào thông báo
        const handleNotificationClick = (event: any) => {
            const data = event.notification.additionalData;

            if (data?._id !== '') {
                setRedirectData('schdule', data?._id);
            } else {
                setRedirectData('request', data?.requestId);
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

    if (!isReady) {
        return <Loading />;
    }

    return <Router />;
};

export default function App() {
    return (
        <SafeAreaView edges={['bottom']} style={{flex: 1}}>
            <InitApp />
        </SafeAreaView>
    );
}
