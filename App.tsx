/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';

/* configurations */
import UpdateRequiredModal from '@/utils/useForceUpdate';
import {useAuthStore} from './src/stores/authStore';
import asyncStorageHelper from './src/utils/localStorageHelper/index';

/* packages */
import {SafeAreaView} from 'react-native-safe-area-context';
import {OneSignal, LogLevel} from 'react-native-onesignal';
import VersionCheck from 'react-native-version-check';
import 'react-native-reanimated';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';
import {StatusBar} from 'react-native';

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

            if (data?._id && data._id !== '') {
                //điều hướng xem chi tiết quy trình
                setRedirectData('schdule', data?._id);
            } else if (data?.requestId && data.requestId !== '') {
                //điều hướng duyệt quy trình khi người ld gửi lên
                setRedirectData('request', data?.requestId);
            } else if (data.gardenId && data.gardenId !== '') {
                //điều hướng duyệt thu hoạch khi người ld gửi lên
                setRedirectData('harvest', data?.gardenId);
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
    const {isLogin} = useAuthStore();
    const [isUpdateRequired, setIsUpdateRequired] = useState<boolean>(false);

    console.log('get-update-version: ', isUpdateRequired);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const currentVersion = VersionCheck.getCurrentVersion();
                // const currentVersion = '0.0.1';
                const latestVersion = await VersionCheck.getLatestVersion();

                // Hàm so sánh phiên bản, ví dụ: "1.2.10" với "1.2.9"
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
                console.log('Lỗi kiểm tra phiên bản:', error);
            }
        };
        checkVersion();
    }, []);

    return (
        <SafeAreaView style={{flex: 1}} edges={['bottom']}>
            <StatusBar barStyle={isLogin ? 'dark-content' : 'light-content'} />
            <InitApp />
            {/* Modal yêu cầu cập nhật */}
            <UpdateRequiredModal
                visible={isUpdateRequired}
                onClose={() => setIsUpdateRequired(false)}
            />
        </SafeAreaView>
    );
}
