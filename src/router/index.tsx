import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Loading from '../screens/subscreen/Loading';
import SCREEN_INFO from '../config/SCREEN_CONFIG/screenInfo';
import {UNAUTHENTICATION_SCREENS} from '../config/SCREEN_CONFIG/unauthentication';
import colors from '../assets/colors';
import BottomTabsNavigator from './BottomTabsNavigator';
//import {useAuth} from '../contexts/AuthContext';
import useAuthStore from '../stores/authStore';

const Stack = createNativeStackNavigator();

export default function Router() {
    //const {isLogin, userInfo} = useAuth();

    const {isLogin} = useAuthStore();

    const isLoggedIn: unknown = isLogin;

    const renderStackScreenGroup = () => {
        switch (isLoggedIn) {
            case undefined:
                // 🕵🏼‍♀️ Màn đang kiểm tra xem user đã login hay
                return (
                    <Stack.Screen
                        name={SCREEN_INFO.LOADING.key}
                        component={Loading}
                        options={{
                            headerShown: false,
                        }}
                    />
                );
            case false:
                // 💥 Trường hợp user chưa đăng nhập
                return (
                    <Stack.Group>
                        {UNAUTHENTICATION_SCREENS.map((screen, index) => (
                            <Stack.Screen
                                key={index}
                                name={screen.name}
                                component={screen.component}
                                options={screen.options}
                            />
                        ))}
                    </Stack.Group>
                );

            // case true:
            //     // 🌈 MAIN FLOW : user đã đăng nhập. Áp dụng tất cả các role
            //     return (
            //         <Stack.Group>
            //             {AUTHENTICATION_SCREENS.map((screen, index) => (
            //                 <Stack.Screen
            //                     key={index}
            //                     name={screen.name}
            //                     component={screen.component}
            //                     options={screen.options}
            //                 />
            //             ))}
            //         </Stack.Group>
            //     );

            default:
                return null;
        }
    };

    return (
        <NavigationContainer>
            {isLoggedIn ? (
                <>
                    <BottomTabsNavigator />
                </>
            ) : (
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.white,
                        },
                        headerTitleAlign: 'center',
                        headerTintColor: 'white',
                        headerShadowVisible: false,
                    }}>
                    {renderStackScreenGroup()}
                </Stack.Navigator>
            )}
            {/* <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.white,
                    },
                    headerTitleAlign: 'center',
                    headerTintColor: 'black',
                    headerShadowVisible: false,
                }}>
                {renderStackScreenGroup()}
            </Stack.Navigator> */}
        </NavigationContainer>
    );
}
