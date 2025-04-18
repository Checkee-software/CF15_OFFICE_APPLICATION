import React, {useState, useEffect} from 'react';

/* configurations */
import asyncStorageHelper from './src/utils/localStorageHelper/index';
import useAuthStore from './src/stores/authStore';

/* packages */
import {SafeAreaProvider} from 'react-native-safe-area-context';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';

const InitApp = () => {
    const {autoLogin} = useAuthStore();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            await asyncStorageHelper.awaitLoaded();
            const token = asyncStorageHelper.token;
            const userAccount = asyncStorageHelper.userAccount;
            if (token !== '' && userAccount?.userName !== '') {
                autoLogin(userAccount);
            }
            setIsReady(prevState => !prevState);
        };

        init();
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
