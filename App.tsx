import React from 'react';

/* configurations */
import asyncStorageHelper from './src/utils/localStorageHelper/index';

/* packages */
import {SafeAreaProvider} from 'react-native-safe-area-context';

/* screens */
import Router from './src/router';
import Loading from './src/screens/subscreen/Loading';

export default function App() {
    if (asyncStorageHelper.isLoad) {
        return <Loading />;
    } else {
        return (
            <SafeAreaProvider>
                <Router />
            </SafeAreaProvider>
        );
    }
}
