import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Work from '../screens/home/Work';
import CameraScanner from '../screens/global/CameraScanner';
import History from '../screens/home/History';
import Profile from '../screens/user/Profile';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';

const BottomTabsNavigator = () => {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: 'white',
                },
                headerShown: false,
                animation: 'shift',
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                tabBarActiveTintColor: 'rgba(76, 175, 80, 1)',
                tabBarInactiveTintColor: 'gray',
            }}>
            <Tab.Screen
                component={HomeStack}
                name='Trang chủ'
                options={{
                    tabBarIcon: ({size, color}) => (
                        <MaterialIcons name='home' size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                component={Work}
                name='Công việc'
                options={{
                    headerShown: true,
                    tabBarIcon: ({size, color}) => (
                        <MaterialIcons name='work' size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                component={CameraScanner}
                name='Quét'
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
            />

            <Tab.Screen
                component={History}
                name='Lịch sử'
                options={{
                    headerShown: true,
                    tabBarIcon: ({size, color}) => (
                        <MaterialIcons
                            name='history'
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                component={Profile}
                name='Hồ sơ'
                options={{
                    headerShown: true,
                    tabBarIcon: ({size, color}) => (
                        <FontAwesome name='user' size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabsNavigator;

const style = StyleSheet.create({
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
