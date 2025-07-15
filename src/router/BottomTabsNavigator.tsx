/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable jsx-quotes */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Work from '../screens/home/Work';
import AutomaticTracing from '../screens/onboarding/AutomaticTracing';
import History from '../screens/home/History';
import Profile from '../screens/user/Profile';
import Main from '../screens/home/Main';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SCREEN_INFO from '../config/SCREEN_CONFIG/screenInfo';
import Backdrop from '@/screens/subscreen/Loading/index2';
import {useAuthStore} from '@/stores/authStore';

const BottomTabsNavigator = ({navigation}: any) => {
    const {redirectData, redirectDataRequestSchedule, clearRedirectData} =
        useAuthStore();

    const Tab = createBottomTabNavigator();

    useEffect(() => {
        if (redirectData) {
            navigation.navigate(SCREEN_INFO.SCHEDULEDETAIL.key, {
                _id: redirectData,
            });

            setTimeout(() => {
                clearRedirectData();
            }, 1000);
        }
    }, [redirectData]);

    return redirectData ? (
        <Backdrop open />
    ) : (
        <Tab.Navigator
            initialRouteName={
                redirectDataRequestSchedule ? 'Công việc' : 'Trang chủ'
            }
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                tabBarStyle: {
                    borderColor: '#D3D3D3',
                    borderTopWidth: 1,
                    boxShadow: '-1 2 0 #00000040',
                },
                headerShown: false,
                tabBarHideOnKeyboard: true,
                animation: 'shift',
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                tabBarActiveTintColor: 'rgba(76, 175, 80, 1)',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontSize: 10,
                },
            }}>
            <Tab.Screen
                component={Main}
                name='Trang chủ'
                options={{
                    headerTitle: 'CF15 OFFICE',
                    headerTitleStyle: style.headerTitle,
                    headerShown: true,
                    tabBarIcon: ({color}) => (
                        <MaterialIcons
                            name='dashboard'
                            size={26}
                            color={color}
                        />
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            style={style.alertView}
                            onPress={() =>
                                navigation.navigate(
                                    SCREEN_INFO.LISTNOTIFICATION.key,
                                )
                            }>
                            <View style={style.alertDot} />
                            <FontAwesome
                                name='bell'
                                size={26}
                                color={'rgba(76, 175, 80, 1)'}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tab.Screen
                component={Work}
                name='Công việc'
                options={{
                    headerShown: true,
                    headerTitle: 'CÔNG VIỆC KHU VƯỜN',
                    headerTitleStyle: style.headerTitle,
                    tabBarIcon: ({color}) => (
                        <MaterialIcons name='work' size={26} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                component={AutomaticTracing}
                name='ScanScreen'
                options={{
                    headerShown: true,
                    tabBarButton: props => (
                        <TouchableOpacity
                            style={style.cameraBottomTab}
                            onPress={props.onPress}>
                            <MaterialCommunityIcons
                                name='line-scan'
                                size={35}
                                color='white'
                            />
                        </TouchableOpacity>
                    ),
                    tabBarLabel: () => null, // Ẩn label chỉ ở tab này
                }}
                listeners={{
                    tabPress: e => {
                        e.preventDefault(); // Chặn chuyển tab
                        Alert.alert(
                            'Thông báo',
                            'Chức năng này đang được phát triển, bạn hãy quay lại sau nhé!',
                            [{text: 'OK'}],
                        );
                    },
                }}
            />

            <Tab.Screen
                component={History}
                name='Lịch sử'
                options={{
                    headerShown: true,
                    headerTitle: 'LỊCH SỬ HOẠT ĐỘNG',
                    headerTitleStyle: style.headerTitle,
                    tabBarIcon: ({color}) => (
                        <MaterialIcons name='history' size={26} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                component={Profile}
                name='Hồ sơ'
                options={{
                    headerShown: true,
                    headerTitle: 'HỒ SƠ',
                    headerTitleStyle: style.headerTitle,
                    tabBarIcon: ({color}) => (
                        <FontAwesome name='user' size={26} color={color} />
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            style={style.alertView}
                            onPress={() =>
                                navigation.navigate(
                                    SCREEN_INFO.LISTNOTIFICATION.key,
                                )
                            }>
                            <View style={style.alertDot} />
                            <FontAwesome
                                name='bell'
                                size={26}
                                color={'rgba(76, 175, 80, 1)'}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabsNavigator;

const style = StyleSheet.create({
    headerTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: 'rgba(0, 0, 0, 1)',
    },
    cameraBottomTab: {
        borderRadius: '50%',
        backgroundColor: 'rgba(76, 175, 80, 1)',
        width: 60,
        height: 60,
        top: -30,
        margin: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertView: {
        position: 'relative',
        marginRight: 20,
    },
    alertDot: {
        position: 'absolute',
        right: 1,
        height: 10,
        width: 10,
        backgroundColor: 'red',
        borderRadius: 25,
        zIndex: 10,
    },
});
