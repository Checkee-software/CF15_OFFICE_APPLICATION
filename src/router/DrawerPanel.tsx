import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';

/* components */

/* configurations */
import colors from '../assets/colors';

/* packages */
import {DrawerContentScrollView} from '@react-navigation/drawer';

/* screens */
import FeatherIcon from 'react-native-vector-icons/Feather';
import SCREEN_INFO from '../config/SCREEN_CONFIG/screenInfo';

const DrawerPanel = ({navigation}: {navigation: any}) => {
    const {height} = useWindowDimensions();

    const menuButtons = [
        {
            colorScheme: 'orange',
            title: 'Thông tin tài khoản',
            icon: 'user',
            handleOnPress: () => navigation.navigate(SCREEN_INFO.PROFILE.key),
        },
        {
            colorScheme: 'orange',
            title: 'Đổi mật khẩu',
            icon: 'lock',
            handleOnPress: () =>
                navigation.navigate(SCREEN_INFO.UPDATE_PASSWORD.key),
        },
        {
            title: 'Đăng xuất',
            colorScheme: 'blue',
            icon: 'chevrons-right',
            handleOnPress: () => {
                // dispatch(processingFacilitySliceActions.Remove_Customer_Receipt()) // reset state when logout
                // dispatch(processingFacilitySliceActions.Remove_Customer_Issue()) // reset state when logout
                // dispatch(authActions.logout())
            },
        },
    ];

    return (
        <DrawerContentScrollView
            style={{flex: 1, backgroundColor: colors.white}}>
            <View style={[styles.container, {height: height}]}>
                <View style={{flex: 1, flexDirection: 'column'}}>
                    {menuButtons
                        .filter((item, index) => index < 3)
                        .map((item, index) => (
                            <TouchableOpacity
                                style={styles.button}
                                key={index}
                                onPress={item.handleOnPress}>
                                <View style={styles.iconContainer}>
                                    <FeatherIcon
                                        name={item.icon}
                                        size={24}
                                        color={colors.black}
                                    />
                                </View>

                                <Text style={styles.title}>{item.title}</Text>
                                <FeatherIcon
                                    name={'chevron-right'}
                                    size={24}
                                    color={colors.black}
                                />
                            </TouchableOpacity>
                        ))}
                </View>
                <View style={{height: height * 0.12}}>
                    {menuButtons
                        .filter((_, index) => index > 1)
                        .map((item, index) => (
                            <TouchableOpacity
                                style={styles.button}
                                key={index}
                                onPress={item.handleOnPress}>
                                <View style={styles.iconContainer}>
                                    <FeatherIcon
                                        name={item.icon}
                                        size={24}
                                        color={colors.black}
                                    />
                                </View>

                                <Text style={styles.title}>{item.title}</Text>
                                <FeatherIcon
                                    name={'chevron-right'}
                                    size={24}
                                    color={colors.black}
                                />
                            </TouchableOpacity>
                        ))}
                </View>
            </View>
        </DrawerContentScrollView>
    );
};

export default DrawerPanel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    button: {
        padding: 8,
        elevation: 2,
        borderRadius: 32,
        flexDirection: 'row',
        width: '100%',
        height: 64,
        backgroundColor: colors.white,
        alignItems: 'center',
        shadowOffset: {width: 0, height: 1},
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOpacity: 0.25,
        shadowRadius: 2,
    },
    iconContainer: {
        borderRadius: 24,
        width: 48,
        height: 48,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 48,
        height: 48,
        tintColor: colors.white,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginHorizontal: 8,
        color: colors.black,
    },
});

//📹 Custom Drawer Navigator in React Navigation 6
//🐉 https://www.youtube.com/watch?v=l8nY4Alk70Q&t=1122s&ab_channel=PradipDebnath
