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

        if (hour >= 5 && hour < 11) {
            return 'Chào buổi sáng';
        } else if (hour >= 11 && hour < 13) {
            return 'Chào buổi trưa';
        } else if (hour >= 13 && hour < 18) {
            return 'Chào buổi chiều';
        } else if (hour >= 18 && hour < 22) {
            return 'Chào buổi tối';
        } else {
            return 'Chúc ngủ ngon';
        }
    };

    const formatDateWithWeekdayNumber = () => {
        const mDate = moment();
        const weekday = mDate.isoWeekday(); // Thứ 2 = 1, Chủ nhật = 7
        return `${
            weekday === 7 ? 'Chủ Nhật' : `Thứ ${weekday + 1}`
        }, ${mDate.format('DD.MM.YYYY')}`;
    };

    return (
        <View style={MainStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={MainStyles.welcomeUser}>
                    <View style={MainStyles.helloTime}>
                        <Text style={MainStyles.helloTimeText}>
                            {getGreeting()}
                        </Text>
                        <Text style={MainStyles.helloUserText}>
                            {userInfo.fullName}
                        </Text>
                    </View>

                    <View style={MainStyles.avatarUser}>
                        <Image
                            source={images.avatar}
                            style={MainStyles.avatar}
                            resizeMode='contain'
                        />
                    </View>
                </View>

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
                                    <Text style={MainStyles.btnRollCallText}>
                                        Đã điểm danh
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={MainStyles.btnEndWorking}>
                                    <Text style={MainStyles.btnRollCallText}>
                                        Kết thúc
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={MainStyles.btnRollCall}>
                                <Text style={MainStyles.btnRollCallText}>
                                    Điểm Danh
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={MainStyles.syntheticJob}>
                    <View style={MainStyles.sideJob}>
                        <View style={MainStyles.warpSideJobText}>
                            <Text style={MainStyles.sideJobHeaderText}>
                                Công việc con 1/3
                            </Text>
                            <Text style={MainStyles.sideJobContentText}>
                                Lorem ipsum dolor sit amet consecte tur. Viverra
                                id penatibus eget ut eget phasellus id.
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
                                Đang thực hiện
                            </Text>
                            <Text style={MainStyles.onProgressText}>50%</Text>
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
                        <TouchableOpacity style={MainStyles.menuButton}>
                            <Image
                                source={images.gardener}
                                style={MainStyles.menuButtonImage}
                            />
                            <Text style={MainStyles.menuButtonText}>
                                Khai báo khu vườn
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={MainStyles.menuButton}>
                            <Image
                                source={images.garden}
                                style={MainStyles.menuButtonImage}
                            />
                            <Text style={MainStyles.menuButtonText}>
                                Thông tin khu vườn
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={MainStyles.menuButton}>
                            <Image
                                source={images.workers}
                                style={MainStyles.menuButtonImage}
                            />
                            <Text style={MainStyles.menuButtonText}>
                                Người lao động
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={MainStyles.menuButton}
                            onPress={() =>
                                navigation.navigate(SCREEN_INFO.BROWSEJOBS.key)
                            }>
                            <Image
                                source={images.toDoList}
                                style={MainStyles.menuButtonImage}
                            />
                            <Text style={MainStyles.menuButtonText}>
                                Duyệt công việc
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={MainStyles.menuButton}
                            onPress={() =>
                                navigation.navigate(SCREEN_INFO.FEEDBACK.key)
                            }>
                            <Image
                                source={images.feedBack}
                                style={MainStyles.menuButtonImage}
                            />
                            <Text style={MainStyles.menuButtonText}>Góp ý</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={MainStyles.menuButton}
                            onPress={() =>
                                navigation.navigate(SCREEN_INFO.NEWS.key)
                            }>
                            <Image
                                source={images.megaphone}
                                style={MainStyles.menuButtonImage}
                            />
                            <Text style={MainStyles.menuButtonText}>
                                Tin tức
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={MainStyles.menuButton}
                            onPress={() =>
                                navigation.navigate(SCREEN_INFO.DOCUMENT.key)
                            }>
                            <Image
                                source={images.document}
                                style={MainStyles.menuButtonImage}
                            />
                            <Text style={MainStyles.menuButtonText}>
                                Tài liệu
                            </Text>
                        </TouchableOpacity>
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
        marginBottom: 15,
    },
    helloTime: {
        flexDirection: 'column',
    },
    helloTimeText: {
        color: 'rgba(76, 175, 80, 1)',
    },
    helloUserText: {
        color: 'rgba(76, 175, 80, 1)',
        fontWeight: '500',
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
        height: 50,
        aspectRatio: 1,
        borderRadius: 25,
    },
    rollCall: {
        //marginVertical: 20,
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
        marginTop: 15,
    },
    sideJob: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    warpSideJobText: {
        width: '70%',
    },
    sideJobHeaderText: {
        fontWeight: 500,
        width: '70%',
    },
    sideJobContentText: {
        marginTop: 6,
        fontWeight: 300,
        fontSize: 13,
        color: 'rgba(128, 128, 128, 1)',
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
        marginBottom: 5,
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
