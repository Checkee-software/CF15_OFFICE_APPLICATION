import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import images from '../../../assets/images';
import 'moment/locale/vi';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import {useAuthStore} from '../../../stores/authStore';
import asyncStorageHelper from '../../../utils/localStorageHelper/index';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

export default function Main({navigation}: any) {
    const {userInfo} = useAuthStore();

    console.log('Token hiện tại:', asyncStorageHelper.token);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 13) {
            const valueGreeting = {
                greetingText: 'Chào buổi sáng',
                colorGreetingText: 'rgba(76, 175, 80, 1)',
            };
            return valueGreeting;
        }
        // } else if (hour >= 11 && hour < 13) {
        //     return 'Chào buổi trưa';
        // }
        else if (hour >= 13 && hour < 18) {
            const valueGreeting = {
                greetingText: 'Chào buổi chiều',
                colorGreetingText: 'rgba(255, 152, 0, 1)',
            };
            return valueGreeting;
        } else if (hour >= 18 && hour < 22) {
            const valueGreeting = {
                greetingText: 'Chào buổi tối',
                colorGreetingText: 'rgba(33, 150, 243, 1)',
            };
            return valueGreeting;
        } else {
            const valueGreeting = {
                greetingText: 'Chúc ngủ ngon!',
                colorGreetingText: 'rgba(66, 31, 25, 1)',
            };
            return valueGreeting;
        }
    };

    const menuItems = [
        {
            key: 'gardenForWorker',
            label: 'Khu vườn',
            buttonImage: images.garden,
            navigateTo: SCREEN_INFO.GARDENINFOWORKER.key,
            navigateNext: SCREEN_INFO.GARDENWORKER.key,
        },
        {
            key: 'gardenDeclareForWorker',
            label: 'Khai báo khu vườn',
            buttonImage: images.gardener,
            navigateTo: SCREEN_INFO.GARDENINFOWORKER.key,
            navigateNext: SCREEN_INFO.GARDENDECLAREWORKER.key,
        },
        {
            key: 'gardenInfo',
            label: 'Thông tin khu vườn',
            buttonImage: images.garden,
            navigateTo: SCREEN_INFO.GARDENINFO.key,
        },
        {
            key: 'unit',
            label: 'Đơn vị',
            buttonImage: images.workers,
            navigateTo: SCREEN_INFO.UNIT.key,
        },
        {
            key: 'employee',
            label: 'Nhân sự',
            buttonImage: images.workers,
            navigateTo: SCREEN_INFO.WORKER.key,
        },
        {
            key: 'workschedule',
            label: 'Lịch làm việc',
            buttonImage: images.toDoList,
            navigateTo: SCREEN_INFO.WORKSCHEDULE.key,
        },
        {
            key: 'feedback',
            label: 'Góp ý',
            buttonImage: images.feedBack,
            navigateTo: SCREEN_INFO.FEEDBACK.key,
        },
        {
            key: 'news',
            label: 'Tin tức',
            buttonImage: images.megaphone,
            navigateTo: SCREEN_INFO.NEWS.key,
        },
        {
            key: 'document',
            label: 'Tài liệu',
            buttonImage: images.document,
            navigateTo: SCREEN_INFO.DOCUMENT.key,
        },
        {
            key: 'statistic',
            label: 'Báo cáo thống kê',
            buttonImage: images.pieChart,
            navigateTo: SCREEN_INFO.STATISTIC.key,
        },
    ];

    const filterMenuByRole = (role: string) => {
        if (role === EOrganization.DEPARTMENT) {
            return menuItems.filter(
                item =>
                    item.key !== 'gardenForWorker' &&
                    item.key !== 'gardenDeclareForWorker' &&
                    item.key !== 'unit',
            );
        }

        if (role === EOrganization.LEADER) {
            return menuItems.filter(
                item =>
                    item.key !== 'gardenForWorker' &&
                    item.key !== 'gardenDeclareForWorker' &&
                    item.key !== 'employee',
            );
        }

        if (role === EOrganization.WORKER) {
            return menuItems.filter(
                item =>
                    item.key !== 'unit' &&
                    item.key !== 'employee' &&
                    item.key !== 'gardenInfo',
            );
        }

        return []; // Nếu không hợp lệ, trả mảng trống
    };

    const menuList = filterMenuByRole(userInfo.userType.level);

    const greetingValue = getGreeting();

    return (
        <View style={MainStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={MainStyles.welcomeUser}>
                    <View style={MainStyles.helloTime}>
                        <Text
                            style={[
                                MainStyles.helloTimeText,
                                {color: greetingValue.colorGreetingText},
                            ]}>
                            {greetingValue.greetingText}
                        </Text>
                        <Text
                            style={[
                                MainStyles.helloUserText,
                                {color: greetingValue.colorGreetingText},
                            ]}>
                            {userInfo.fullName}
                        </Text>
                    </View>

                    <View style={MainStyles.avatarUser}>
                        <Image
                            source={
                                userInfo.avatar
                                    ? {
                                          uri: userInfo.avatar,
                                      }
                                    : images.avatar
                            }
                            style={MainStyles.avatar}
                        />
                    </View>
                </View>

                <View style={MainStyles.mainMenu}>
                    <View style={MainStyles.warpMenuButton}>
                        {menuList.map(item => (
                            <TouchableOpacity
                                key={item.key}
                                style={MainStyles.menuButton}
                                onPress={() =>
                                    navigation.navigate(item.navigateTo, {
                                        navigateNext: item.navigateNext || null,
                                    })
                                }>
                                <Image
                                    source={item.buttonImage}
                                    style={MainStyles.menuButtonImage}
                                />
                                <Text style={MainStyles.menuButtonText}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const MainStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
    },
    welcomeUser: {
        flexDirection: 'row',
        alignItems: 'center',
        color: 'rgba(76, 175, 80, 1)',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    helloTime: {
        flexDirection: 'column',
    },
    helloTimeText: {
        fontSize: 13,
        fontWeight: 400,
    },
    helloUserText: {
        fontWeight: '600',
        fontSize: 15,
    },
    avatarUser: {
        borderRadius: '50%',
        backgroundColor: 'rgba(128, 128, 128, 0.15)',
        width: 60,
        height: 60,
    },
    avatar: {
        margin: 'auto',
        width: 50,
        height: 52,
        borderRadius: 25,
    },
    mainMenu: {
        marginVertical: 5,
    },
    mainMenuTitle: {
        color: 'rgba(128, 128, 128, 1)',
        fontWeight: '500',
    },
    warpMenuButton: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    menuButton: {
        width: '48%',
        paddingVertical: 24,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1 3 0 rgba(0, 0, 0, 0.25)',
    },
    menuButtonImage: {
        width: 80,
        height: 80,
        aspectRatio: 1,
    },
    menuButtonText: {
        marginTop: 10,
        fontSize: 12,
    },
});
