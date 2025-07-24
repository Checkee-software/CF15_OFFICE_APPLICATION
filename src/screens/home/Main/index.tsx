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
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

export default function Main({navigation}: any) {
    const {userInfo} = useAuthStore();

    //console.log(userInfo);

    const menuItems = [
        {
            function: 'GARDEN',
            key: 'gardenForWorker',
            label: 'Khu vườn',
            buttonImage: images.garden,
            navigateTo: SCREEN_INFO.GARDENINFOWORKER.key,
            navigateNext: SCREEN_INFO.GARDENWORKER.key,
        },
        {
            function: '',
            key: 'gardenDeclareForWorker',
            label: 'Báo cáo quy trình',
            buttonImage: images.gardener,
            navigateTo: SCREEN_INFO.GARDENINFOWORKER1.key,
            navigateNext: SCREEN_INFO.GARDENDECLAREWORKER.key,
        },
        {
            function: 'GARDEN',
            key: 'gardenInfo',
            label: 'Thông tin khu vườn',
            buttonImage: images.garden,
            navigateTo: SCREEN_INFO.GARDENINFO.key,
        },
        {
            function: 'EMPLOYEES',
            key: 'unit',
            label: 'Nhân sự',
            buttonImage: images.workers,
            navigateTo: SCREEN_INFO.UNIT.key,
        },
        {
            function: 'EMPLOYEES',
            key: 'employee',
            label: 'Nhân sự',
            buttonImage: images.workers,
            navigateTo: SCREEN_INFO.WORKER.key,
        },
        {
            function: 'SCHEDULE',
            key: 'workschedule',
            label: 'Lịch sử quy trình',
            buttonImage: images.toDoList,
            navigateTo: SCREEN_INFO.WORKSCHEDULE.key,
        },
        {
            function: 'STATISTIC',
            key: 'statistic',
            label: 'Báo cáo thống kê',
            buttonImage: images.pieChart,
            navigateTo: SCREEN_INFO.STATISTIC.key,
        },
        {
            function: '',
            key: 'browseaddmaterial',
            label: 'Duyệt đầu tư tăng thêm',
            buttonImage: images.approve,
            navigateTo: SCREEN_INFO.BROWSEADDMATERIALS.key,
        },
        {
            function: 'FEEDBACK',
            key: 'feedback',
            label: 'Góp ý',
            buttonImage: images.feedBack,
            navigateTo: SCREEN_INFO.FEEDBACK.key,
        },
        {
            function: 'DOCUMENT',
            key: 'document',
            label: 'Tài liệu',
            buttonImage: images.document,
            navigateTo: SCREEN_INFO.DOCUMENT.key,
        },
        {
            function: '',
            key: 'news',
            label: 'Tin tức',
            buttonImage: images.megaphone,
            navigateTo: SCREEN_INFO.NEWS.key,
        },
    ];

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

    const filterMenuByRole = (role: string) => {
        const hasAccessToFunction = (functionKey: string) => {
            return userInfo.functions.some(
                func => func._id === functionKey && func.access,
            );
        };

        let filteredMenu: typeof menuItems = [];

        if (role === EOrganization.MANAGEMENT) {
            filteredMenu = menuItems.filter(
                item =>
                    item.key !== 'gardenForWorker' &&
                    item.key !== 'gardenDeclareForWorker' &&
                    item.key !== 'gardenInfo' &&
                    item.key !== 'unit' &&
                    item.key !== 'workschedule' &&
                    item.key !== 'browseaddmaterial',
            );
            const reorderedMenu = [
                ...filteredMenu.filter(item => item.key === 'statistic'),
                ...filteredMenu.filter(item => item.key !== 'statistic'),
            ];
            return reorderedMenu.filter(
                item => !item.function || hasAccessToFunction(item.function),
            );
        }

        if (role === EOrganization.DEPARTMENT) {
            filteredMenu = menuItems.filter(
                item =>
                    item.key !== 'gardenForWorker' &&
                    item.key !== 'gardenDeclareForWorker' &&
                    item.key !== 'unit' &&
                    item.key !== 'browseaddmaterial',
            );
            return filteredMenu.filter(
                item => !item.function || hasAccessToFunction(item.function),
            );
        }

        if (role === EOrganization.LEADER) {
            filteredMenu = menuItems.filter(item => {
                const excludeKeys =
                    item.key !== 'gardenForWorker' &&
                    item.key !== 'gardenDeclareForWorker' &&
                    item.key !== 'employee';

                const excludeStatistic =
                    userInfo.groupId === '' ? item.key !== 'statistic' : true;

                return excludeKeys && excludeStatistic;
            });

            return filteredMenu.filter(
                item => !item.function || hasAccessToFunction(item.function),
            );
        }

        if (role === EOrganization.WORKER) {
            filteredMenu = menuItems.filter(
                item =>
                    item.key !== 'unit' &&
                    item.key !== 'employee' &&
                    item.key !== 'gardenInfo' &&
                    item.key !== 'browseaddmaterial',
            );

            return filteredMenu.filter(item => {
                // Chỉ kiểm tra quyền access đối với STATISTIC
                if (item.function === 'STATISTIC') {
                    return hasAccessToFunction(item.function);
                }
                return true;
            });
        }

        return [];
    };

    const menuList = filterMenuByRole(userInfo.userType.level);

    const greetingValue = getGreeting();

    return (
        <View style={MainStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode='never'>
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

                    <TouchableOpacity
                        style={MainStyles.avatarUser}
                        onPress={() => navigation.navigate('Hồ sơ')}>
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
                    </TouchableOpacity>
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
        gap: 10,
        paddingVertical: 24,
        paddingHorizontal: 15,
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
        fontSize: 12,
        flexShrink: 1,
        textAlign: 'center',
    },
});
