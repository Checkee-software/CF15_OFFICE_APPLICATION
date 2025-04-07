import React from 'react';

/* configurations */
import colors from '../assets/colors';
import SCREEN_INFO from '../config/SCREEN_CONFIG/screenInfo';

/* packages */
import AntDesign from 'react-native-vector-icons/AntDesign';
import {createDrawerNavigator} from '@react-navigation/drawer';

/* screens */
import DrawerPanel from './DrawerPanel';
import Main from '../screens/home/Main';

export default function DrawerSideBarMenu({navigation}: {navigation: any}) {
    const Drawer = createDrawerNavigator();

    const goToScan = () => navigation.navigate(SCREEN_INFO.CAMERA_SCANNER.key);

    return (
        <Drawer.Navigator
            initialRouteName={SCREEN_INFO.MAIN.key}
            // eslint-disable-next-line react/no-unstable-nested-components
            drawerContent={() => <DrawerPanel navigation={navigation} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.white,
                },
                headerTitleAlign: 'center',
                headerTintColor: colors.white,
            }}>
            <Drawer.Screen
                name={SCREEN_INFO.MAIN.key}
                component={Main}
                options={{
                    title: SCREEN_INFO.MAIN.headerTitle,
                    // eslint-disable-next-line react/no-unstable-nested-components
                    headerRight: () => (
                        // eslint-disable-next-line react-native/no-inline-styles
                        <AntDesign
                            style={{marginRight: 16}}
                            onPress={goToScan}
                            name={'scan1'}
                            color={colors.white}
                            size={24}
                        />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}
