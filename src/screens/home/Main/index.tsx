import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import images from '../../../assets/images';
import * as Progress from 'react-native-progress';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/vi';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import useAuthStore from '../../../stores/authStore';
import asyncStorageHelper from '../../../utils/localStorageHelper/index';

export default function Main({navigation}) {
    const {userInfo} = useAuthStore();

    console.log('Token hiện tại:', asyncStorageHelper.token);
    console.log('User', asyncStorageHelper.userAccount);

    const isRollCall = true;

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

    const formatDateWithWeekdayNumber = () => {
        const mDate = moment();
        const weekday = mDate.isoWeekday(); // Thứ 2 = 1, Chủ nhật = 7
        return `${
            weekday === 7 ? 'Chủ Nhật' : `Thứ ${weekday + 1}`
        }, ${mDate.format('DD.MM.YYYY')}`;
    };

    const menuItems = [
        {
            key: 'gardenForWorker',
            label: 'Khu vườn',
            buttonImage: images.garden,
            navigateTo: SCREEN_INFO.GARDENCAMERASCAN.key,
            navigateNext: SCREEN_INFO.GARDENWORKER.key,
        },
        {
            key: 'gardenDeclareForWorker',
            label: 'Khai báo khu vườn',
            buttonImage: images.gardener,
            navigateTo: SCREEN_INFO.GARDENCAMERASCAN.key,
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
            key: 'browseJobs',
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
        if (role === 'DEPARTMENT') {
            return menuItems.filter(
                item => item.key !== 'unit' && item.key !== 'gardenDeclare',
            );
        }

        if (role === 'LEADER') {
            return menuItems.filter(
                item => item.key !== 'employee' && item.key !== 'gardenDeclare',
            );
        }

        if (role === 'WORKER') {
            return menuItems.filter(
                item =>
                    item.key !== 'unit' &&
                    item.key !== 'employee' &&
                    item.key !== 'gardenInfo',
            );
        }

        //return menuItems;
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
                            source={{
                                uri: userInfo.avatar,
                            }}
                            style={MainStyles.avatar}
                        />
                    </View>
                </View>

                {userInfo.userType.level === 'WORKER' ? (
                    <View
                        style={[
                            MainStyles.rollCall,
                            isRollCall
                                ? {backgroundColor: 'rgba(76, 175, 80, 0.15)'}
                                : {backgroundColor: 'rgba(255, 152, 0, 0.15)'},
                        ]}>
                        <View style={MainStyles.leftRollCall}>
                            <Text style={MainStyles.todayDateText}>
                                {formatDateWithWeekdayNumber()}
                            </Text>
                            {isRollCall ? (
                                <Text style={MainStyles.workingTimeText}>
                                    Thời gian làm việc: 00:06:32
                                </Text>
                            ) : (
                                <Text style={MainStyles.rollCallRemindText}>
                                    Hôm nay bạn chưa điểm danh
                                </Text>
                            )}

                            <View style={MainStyles.rollCallStreak}>
                                <MaterialCommunityIcons
                                    name='check-circle-outline'
                                    size={20}
                                    color='green'
                                />

                                <MaterialCommunityIcons
                                    name='close-circle'
                                    size={20}
                                    color='rgba(255, 78, 69, 1)'
                                />

                                <MaterialCommunityIcons
                                    name='check-circle-outline'
                                    size={20}
                                    color='green'
                                />

                                <MaterialCommunityIcons
                                    name='check-circle-outline'
                                    size={20}
                                    color='rgba(255, 152, 0, 1)'
                                />

                                <MaterialCommunityIcons
                                    name='check-circle-outline'
                                    size={20}
                                    color='gray'
                                />

                                <MaterialCommunityIcons
                                    name='check-circle-outline'
                                    size={20}
                                    color='gray'
                                />

                                <MaterialCommunityIcons
                                    name='check-circle-outline'
                                    size={20}
                                    color='gray'
                                />
                            </View>
                        </View>

                        <View style={MainStyles.btnRollCallContainer}>
                            {isRollCall ? (
                                <View
                                    style={
                                        MainStyles.warpButtonRollCalledAndEndWorking
                                    }>
                                    <View style={MainStyles.btnRollCalled}>
                                        <Text
                                            style={MainStyles.btnRollCallText}>
                                            Đã điểm danh
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={MainStyles.btnEndWorking}>
                                        <Text
                                            style={MainStyles.btnRollCallText}>
                                            Kết thúc
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={MainStyles.btnRollCall}>
                                    <Text style={MainStyles.btnRollCallText}>
                                        Điểm Danh
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ) : null}

                <View style={MainStyles.syntheticJob}>
                    <View style={MainStyles.sideJob}>
                        <View style={MainStyles.warpSideJobText}>
                            <Text style={MainStyles.sideJobDoCurrent}>
                                Đang thực hiện
                            </Text>
                            <Text style={MainStyles.sideJobContentText}>
                                Nghiên cứu, phân tích giống cây cà phê chồn loại
                                3.
                            </Text>
                            <Text style={MainStyles.sideJobRemaining}>
                                Còn: 23 ngày, 12:05:32
                            </Text>
                        </View>

                        <Progress.Circle
                            size={84}
                            progress={0.7} // Từ 0.0 đến 1.0
                            showsText={true}
                            textStyle={MainStyles.progressValue}
                            unfilledColor={'rgba(211, 211, 211, 1)'}
                            borderWidth={0}
                        />
                    </View>

                    <View style={MainStyles.totalJobProgress}>
                        <View style={MainStyles.onProgress}>
                            <Text style={MainStyles.onProgressText}>
                                (12/04) Nghiên cứu giống chồn A
                            </Text>
                            <Text style={MainStyles.onProgressValue}>50%</Text>
                        </View>

                        <Progress.Bar
                            progress={0.5}
                            width={null} // 100% theo view cha
                            height={6}
                            unfilledColor='#ddd'
                            borderWidth={0}
                        />
                    </View>
                </View>

                <View style={MainStyles.mainMenu}>
                    <Text style={MainStyles.mainMenuTitle}>Chức năng</Text>
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
        backgroundColor: '#fff',
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
    rollCall: {
        marginBottom: 10,
        borderRadius: 15,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftRollCall: {},
    todayDateText: {
        fontWeight: '500',
    },
    rollCallRemindText: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: 200,
        fontStyle: 'italic',
    },
    workingTimeText: {
        marginTop: 6,
        fontSize: 12,
        color: 'rgba(76, 175, 80, 1)',
    },
    rollCallStreak: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
        gap: 6,
        alignItems: 'center',
    },
    warpButtonRollCalledAndEndWorking: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnRollCallContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnRollCalled: {
        backgroundColor: 'rgba(76, 175, 80, 1)', // cam chính
        borderRadius: 100,
        width: 70,
        height: 70,
        borderWidth: 6,
        borderColor: 'rgba(76, 175, 80, 0.15)', // viền ngoài
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnEndWorking: {
        backgroundColor: 'rgba(255, 78, 69, 1)', // cam chính
        borderRadius: 100,
        width: 56,
        height: 56,
        borderWidth: 6,
        borderColor: 'rgba(255, 78, 69, 0.15)', // viền ngoài
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    btnRollCall: {
        backgroundColor: '#ff9800', // cam chính
        borderRadius: 100,
        width: 80,
        height: 80,
        borderWidth: 6,
        borderColor: 'rgba(255, 152, 0, 0.3)', // viền ngoài
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnRollCallText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    syntheticJob: {
        marginTop: 10,
    },
    sideJob: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    warpSideJobText: {
        width: '70%',
        gap: 14,
    },
    sideJobDoCurrent: {
        fontWeight: 500,
        color: 'rgba(33, 150, 243, 1)',
    },
    sideJobContentText: {
        fontWeight: 400,
        fontSize: 14,
        color: 'rgba(33, 33, 33, 1)',
    },
    sideJobRemaining: {
        color: 'rgba(128, 128, 128, 1)',
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: 400,
    },
    progressValue: {
        color: 'black',
        fontWeight: 'bold',
    },
    totalJobProgress: {
        marginTop: 10,
        width: '100%',
    },
    onProgress: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    onProgressText: {
        fontWeight: 400,
        marginVertical: 5,
        fontSize: 12,
        flexShrink: 1,
    },
    onProgressValue: {
        fontWeight: 400,
        marginVertical: 5,
        fontSize: 12,
    },
    mainMenu: {
        marginVertical: 15,
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
