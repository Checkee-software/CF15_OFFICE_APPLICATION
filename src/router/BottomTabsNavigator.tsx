import React from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Work from '../screens/home/Work';
import WorkSchedule from '../screens/home/WorkSchedule';
import CameraScanner from '../screens/global/CameraScanner';
import History from '../screens/home/History';
import Profile from '../screens/user/Profile';
import Main from '../screens/home/Main';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SCREEN_INFO from '../config/SCREEN_CONFIG/screenInfo';

const BottomTabsNavigator = ({navigation}) => {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: 'white',
                },
                tabBarStyle: {
                    height: 55,
                },
                headerShown: false,
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
                    tabBarIcon: ({size, color}) => (
                        <MaterialIcons name='home' size={28} color={color} />
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
                    headerTitle: 'CÔNG VIỆC',
                    headerTitleStyle: style.headerTitle,
                    tabBarIcon: ({size, color}) => (
                        <MaterialIcons name='work' size={26} color={color} />
                    ),
                    // headerRight: () => (
                    //     <TouchableOpacity
                    //         style={style.alertView}
                    //         onPress={() =>
                    //             navigation.navigate(
                    //                 SCREEN_INFO.LISTNOTIFICATION.key,
                    //             )
                    //         }>
                    //         <View style={style.alertDot} />
                    //         <FontAwesome
                    //             name='bell'
                    //             size={26}
                    //             color={'rgba(76, 175, 80, 1)'}
                    //         />
                    //     </TouchableOpacity>
                    // ),
                }}
            />

            <Tab.Screen
                component={CameraScanner}
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
                    tabBarIcon: ({size, color}) => (
                        <MaterialIcons name='history' size={26} color={color} />
                    ),
                    // headerRight: () => (
                    //     <TouchableOpacity
                    //         style={style.alertView}
                    //         onPress={() =>
                    //             navigation.navigate(
                    //                 SCREEN_INFO.LISTNOTIFICATION.key,
                    //             )
                    //         }>
                    //         <View style={style.alertDot} />
                    //         <FontAwesome
                    //             name='bell'
                    //             size={26}
                    //             color={'rgba(76, 175, 80, 1)'}
                    //         />
                    //     </TouchableOpacity>
                    // ),
                }}
                // listeners={{
                //     tabPress: e => {
                //         e.preventDefault(); // Chặn chuyển tab
                //         Alert.alert(
                //             'Thông báo',
                //             'Chức năng này đang được phát triển, bạn hãy quay lại sau nhé!',
                //             [{text: 'OK'}],
                //         );
                //     },
                // }}
            />

            <Tab.Screen
                component={Profile}
                name='Hồ sơ'
                options={{
                    headerShown: true,
                    headerTitle: 'HỒ SƠ',
                    headerTitleStyle: style.headerTitle,
                    tabBarIcon: ({size, color}) => (
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
