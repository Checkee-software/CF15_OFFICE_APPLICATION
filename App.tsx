/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';

/* configurations */
import UpdateRequiredModal from '@/utils/useForceUpdate';
import {useAuthStore} from './src/stores/authStore';
import asyncStorageHelper from './src/utils/localStorageHelper/index';

/* packages */
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import {OneSignal, LogLevel} from 'react-native-onesignal';
import VersionCheck from 'react-native-version-check';
import 'react-native-reanimated';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';
import {persistor, store} from '@/redux/store';

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
        const handleNotificationClick = (event: any) => {
            const data = event.notification.additionalData;

            console.log('notification-click: ', data);

            if (data?.action === 'SCHEDULE') {
                setRedirectData('schdule', data?._id);
            } else if (data?.action === 'REQUEST') {
                setRedirectData('request', data?._id);
            } else if (data?.action === 'HARVEST') {
                setRedirectData('harvest', data?._id);
            }
        };

        OneSignal.Notifications.addEventListener(
            'click',
            handleNotificationClick,
        );

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
    const {isLogin} = useAuthStore();
    const [isUpdateRequired, setIsUpdateRequired] = useState<boolean>(false);

    console.log('get-update-version: ', isUpdateRequired);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const currentVersion = VersionCheck.getCurrentVersion();
                const latestVersion = await VersionCheck.getLatestVersion();

                function compareVersions(v1: string, v2: string): number {
                    const arr1 = v1.split('.').map(Number);
                    const arr2 = v2.split('.').map(Number);
                    const maxLen = Math.max(arr1.length, arr2.length);

                    for (let i = 0; i < maxLen; i++) {
                        const num1 = arr1[i] || 0;
                        const num2 = arr2[i] || 0;

                        if (num1 > num2) return 1;
                        if (num1 < num2) return -1;
                    }
                    return 0;
                }
                if (compareVersions(currentVersion, latestVersion) < 0) {
                    setIsUpdateRequired(true);
                }
            } catch (error) {
                console.log('Loi kiem tra phien ban:', error);
            }
        };
        checkVersion();
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={<Loading />} persistor={persistor}>
                <SafeAreaView style={{flex: 1}} edges={['bottom','top']}>
                    <StatusBar
                        barStyle={'light-content'}
                    />
                    <InitApp />
                    <UpdateRequiredModal
                        visible={isUpdateRequired}
                        onClose={() => setIsUpdateRequired(false)}
                    />
                </SafeAreaView>
            </PersistGate>
        </Provider>
    );
}
