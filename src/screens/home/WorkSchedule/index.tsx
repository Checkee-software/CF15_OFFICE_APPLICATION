/* eslint-disable react-native/no-inline-styles */
import {View, Text, StyleSheet, FlatList, TextInput, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import * as Progress from 'react-native-progress';
import moment from 'moment';
import images from '../../../assets/images';
import {useWorkScheduleStore} from '../../../stores/workScheduleStore';
import {EScheduleStatus} from '@/shared-types/Response/ScheduleResponse/ScheduleResponse';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import Loading from '@/screens/subscreen/Loading';

const WorkSchedule = ({navigation}: any) => {
    const {
        getListWorkSchedule,
        listWorkScheduleFilter,
        isLoading,
        filterByStatus,
        resetData,
    } = useWorkScheduleStore();

    const statusList = [
        {label: 'Tất cả', value: 1},
        {label: 'Đang làm', value: 2},
        {label: 'Hoàn thành', value: 3},
        {label: 'Sắp hết hạn', value: 4},
        {label: 'Trễ hạn', value: 5},
        {label: 'Đang chờ', value: 6},
        {label: 'Đã huỷ', value: 7},
    ];

    const [selectedStatus, setSelectedStatus] = useState(1);
    const [searchSchedule, setSearchSchedule] = useState('');

    const renderCircleColor = (status: string) => {
        switch (status) {
            case EScheduleStatus.PROCESSING:
            case EScheduleStatus.ALMOST_EXPIRE:
            case EScheduleStatus.EXPIRED:
                return '#2196F3';

            case EScheduleStatus.COMPLETED:
                return '#4CAF50';

            case EScheduleStatus.CANCELED:
                return '#FF4E45';

            default:
                return undefined;
        }
    };

    const renderStatusTitle = (status: string) => {
        switch (status) {
            case EScheduleStatus.PENDING:
                return (
                    <Text style={WorkScheduleStyles.pendingAndAlmostExpireText}>
                        Đang chờ
                    </Text>
                );

            case EScheduleStatus.PROCESSING:
                return (
                    <Text style={WorkScheduleStyles.processingText}>
                        Đang thực hiện
                    </Text>
                );

            case EScheduleStatus.COMPLETED:
                return (
                    <Text style={WorkScheduleStyles.completedText}>
                        Hoàn thành
                    </Text>
                );

            case EScheduleStatus.ALMOST_EXPIRE:
                return (
                    <Text style={WorkScheduleStyles.pendingAndAlmostExpireText}>
                        Sắp hết hạn
                    </Text>
                );

            case EScheduleStatus.EXPIRED:
                return (
                    <Text style={WorkScheduleStyles.expiredAndCanceledText}>
                        Trễ hạn
                    </Text>
                );

            case EScheduleStatus.CANCELED:
                return (
                    <Text style={WorkScheduleStyles.expiredAndCanceledText}>
                        Đã hủy
                    </Text>
                );

            default:
                return null;
        }
    };

    const calculateTotalPercent = (taskItem: any) => {
        const tasks = taskItem?.childTasks.tasks;
        const totalTasks = tasks?.length;

        const completedTasks = tasks
            ? tasks.filter(
                  (task: any) => task.status === EScheduleStatus.COMPLETED,
              ).length
            : 0;

        const overallProgress = totalTasks
            ? (completedTasks / totalTasks) * 100
            : 0;

        const overallProgressFormat = overallProgress / 100;

        return overallProgressFormat;
    };

    const renderWorkSchedule = (status: string, finishedDate: string) => {
        const targetTime = moment(finishedDate);
        const now = moment();

        // Tính khoảng cách
        const duration = moment.duration(targetTime.diff(now));

        // Nếu thời gian đã trễ
        if (duration.asMilliseconds() < 0) {
            return (
                <Text
                    style={[
                        WorkScheduleStyles.expiredAndCancelTextTime,
                        {textAlign: 'right'},
                    ]}>
                    Hết hạn
                </Text>
            );
        }

        // Tính số ngày, giờ, phút
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();

        const day = moment(finishedDate).format('L');
        const hour = moment(finishedDate).format('LT');

        switch (status) {
            case EScheduleStatus.PENDING:
                return (
                    <View style={WorkScheduleStyles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#FF9800'}
                        />

                        <Text style={WorkScheduleStyles.startInText}>
                            {`Bắt đầu sau ${days} ngày, ${hours} giờ ${minutes} phút`}
                        </Text>
                    </View>
                );

            case EScheduleStatus.PROCESSING:
            case EScheduleStatus.ALMOST_EXPIRE:
                return (
                    <View style={WorkScheduleStyles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#808080'}
                        />

                        <Text style={WorkScheduleStyles.remainingText}>
                            {`Còn ${days} ngày, ${hours} giờ ${minutes} phút`}
                        </Text>
                    </View>
                );

            case EScheduleStatus.COMPLETED:
                return (
                    <View style={WorkScheduleStyles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#808080'}
                        />

                        <Text style={WorkScheduleStyles.completedTextTime}>
                            {`Hoàn thành lúc ${hour}, ${day}`}
                        </Text>
                    </View>
                );

            case EScheduleStatus.EXPIRED:
                return (
                    <View style={WorkScheduleStyles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#FF4E45'}
                        />

                        <Text
                            style={WorkScheduleStyles.expiredAndCancelTextTime}>
                            {`Hơn ${hours} giờ ${minutes} phút`}
                        </Text>
                    </View>
                );

            case EScheduleStatus.CANCELED:
                return (
                    <View style={WorkScheduleStyles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#FF4E45'}
                        />

                        <Text
                            style={WorkScheduleStyles.expiredAndCancelTextTime}>
                            {`Đã hủy lúc ${hour}, ${day}`}
                        </Text>
                    </View>
                );

            default:
                return null;
        }
    };

    const filterSchedule = listWorkScheduleFilter.filter(item =>
        item.title.toLowerCase().includes(searchSchedule.toLowerCase()),
    );

    const selectScheduleType = (value: number) => {
        if (value === 1) {
            resetData();
        } else if (value === 2) {
            filterByStatus(EScheduleStatus.PROCESSING);
        } else if (value === 3) {
            filterByStatus(EScheduleStatus.COMPLETED);
        } else if (value === 4) {
            filterByStatus(EScheduleStatus.ALMOST_EXPIRE);
        } else if (value === 5) {
            filterByStatus(EScheduleStatus.EXPIRED);
        } else if (value === 6) {
            filterByStatus(EScheduleStatus.PENDING);
        } else {
            filterByStatus(EScheduleStatus.CANCELED);
        }
        setSelectedStatus(value);
    };

    const renderItemWorkSchedule = (itemWorkSchedule: any) => (
        <View style={WorkScheduleStyles.workScheduleMargin}>
            <TouchableOpacity
                style={WorkScheduleStyles.workCard}
                onPress={() =>
                    navigation.navigate(SCREEN_INFO.SCHEDULEDETAIL.key, {
                        itemWorkSchedule,
                    })
                }>
                <Progress.Circle
                    size={40}
                    color={renderCircleColor(itemWorkSchedule.status)}
                    progress={calculateTotalPercent(itemWorkSchedule)} // Từ 0.0 đến 1.0
                    formatText={() =>
                        `${Math.round(
                            calculateTotalPercent(itemWorkSchedule) * 100,
                        )}%`
                    }
                    showsText={true}
                    textStyle={WorkScheduleStyles.progressValue}
                    unfilledColor={'rgba(211, 211, 211, 1)'}
                    borderWidth={0}
                />

                <View style={WorkScheduleStyles.warpInfoWork}>
                    {renderStatusTitle(itemWorkSchedule.status)}
                    <Text style={WorkScheduleStyles.mainWorkTitle}>
                        {itemWorkSchedule.title}
                    </Text>

                    <View style={WorkScheduleStyles.warpChildTasksAndStaffs}>
                        <View style={WorkScheduleStyles.warpIconAndValue}>
                            <MaterialIcons
                                name='checklist-rtl'
                                color={'#808080'}
                                size={20}
                            />

                            <Text style={WorkScheduleStyles.value}>
                                {`${itemWorkSchedule.childTasks.tasks.reduce(
                                    (count: number, task: any) => {
                                        return task.completedPercent === 100
                                            ? count + 1
                                            : count;
                                    },
                                    0,
                                )}/${itemWorkSchedule.childTasks.tasks.length}`}
                            </Text>
                        </View>

                        <View style={WorkScheduleStyles.warpIconAndValueStaff}>
                            <FontAwesome6
                                name='user-group'
                                color={'#808080'}
                                size={14}
                            />

                            <Text style={WorkScheduleStyles.value}>
                                {itemWorkSchedule.employees.length}
                            </Text>
                        </View>
                    </View>

                    {renderWorkSchedule(
                        itemWorkSchedule.status,
                        itemWorkSchedule.finishedDate,
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );

    const handleGetListWorkSchedule = async () => {
        resetData();
        await getListWorkSchedule();
        if (searchSchedule !== '') {
            setSearchSchedule('');
        }
        setSelectedStatus(1);
    };

    useEffect(() => {
        handleGetListWorkSchedule();
        // eslint-disable-next-line
    }, []);

    if (isLoading) return <Loading />;

    return (
        <View style={WorkScheduleStyles.container}>
            <View style={WorkScheduleStyles.workScheduleTypeHorizontalScroll}>
                <FlatList
                    data={statusList}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.label}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => selectScheduleType(item.value)}
                            style={[
                                WorkScheduleStyles.statusBtn,
                                selectedStatus === item.value &&
                                    WorkScheduleStyles.selectedStatusBtn,
                            ]}>
                            <Text
                                style={[
                                    WorkScheduleStyles.statusBtnText,
                                    selectedStatus === item.value &&
                                        WorkScheduleStyles.selectedStatusBtnText,
                                ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={WorkScheduleStyles.listWorkSchedule}>
                <View style={WorkScheduleStyles.searchInput}>
                    <MaterialIcons
                        name='search'
                        color={'rgba(128, 128, 128, 1)'}
                        size={22}
                    />
                    <TextInput
                        placeholder='Tìm kiếm công việc'
                        placeholderTextColor={'rgba(128, 128, 128, 1)'}
                        style={WorkScheduleStyles.input}
                        onChangeText={setSearchSchedule}
                    />
                </View>

                <FlatList
                    contentContainerStyle={WorkScheduleStyles.flatListSchedule}
                    data={filterSchedule}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => renderItemWorkSchedule(item)}
                    onRefresh={handleGetListWorkSchedule}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={WorkScheduleStyles.scheduleListEmpty}>
                            <Image
                                source={images.emptyScheduleList}
                                style={WorkScheduleStyles.emptyScheduleListImg}
                                resizeMode='contain'
                            />
                            <Text
                                style={
                                    WorkScheduleStyles.emptyScheduleListText
                                }>
                                {searchSchedule.length !== 0
                                    ? `Không tìm thấy lịch công việc phù hợp với \n“${searchSchedule}"`
                                    : 'Không tìm thấy danh sách lịch công việc!'}
                            </Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};

const WorkScheduleStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    workScheduleTypeHorizontalScroll: {
        backgroundColor: '#F5F5F5',
    },
    statusBtn: {
        width: 128,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedStatusBtn: {
        borderBottomColor: '#4CAF50',
        borderBottomWidth: 2,
    },
    statusBtnText: {
        fontWeight: 500,
        color: '#212121',
    },
    selectedStatusBtnText: {
        color: '#4CAF50',
        fontWeight: 500,
    },
    listWorkSchedule: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        flex: 1,
    },
    searchInput: {
        borderRadius: 22,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#80808026',
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    input: {
        color: 'black',
        width: '92%',
    },
    flatListSchedule: {
        flexGrow: 1,
    },
    workScheduleMargin: {
        marginVertical: 10,
    },
    workCard: {
        padding: 12,
        borderRadius: 8,
        gap: 8,
        boxShadow: '0 1 3 0 #00000040',
        flexDirection: 'row',
    },
    progressValue: {
        color: 'black',
        fontWeight: '400',
        fontSize: 10,
    },
    warpInfoWork: {
        gap: 8,
        width: '84%',
    },
    pendingAndAlmostExpireText: {
        color: '#FF9800',
        fontSize: 13,
        fontWeight: 500,
    },
    processingText: {
        color: '#2196F3',
        fontSize: 13,
        fontWeight: 500,
    },
    completedText: {
        color: '#4CAF50',
        fontSize: 13,
        fontWeight: 500,
    },
    expiredAndCanceledText: {
        color: '#FF4E45',
        fontSize: 13,
        fontWeight: 500,
    },
    mainWorkTitle: {
        color: '#000000',
        fontWeight: 500,
        fontSize: 14,
    },
    warpChildTasksAndStaffs: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '70%',
    },
    warpIconAndValue: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: 5,
    },
    warpIconAndValueStaff: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    value: {
        color: '#808080',
        fontSize: 12,
        fontWeight: 500,
    },
    workScheduleTime: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    startInText: {
        marginLeft: 5,
        color: '#FF9800',
        fontWeight: 500,
        fontSize: 11,
        fontStyle: 'italic',
    },
    remainingText: {
        marginLeft: 5,
        color: '#212121',
        fontWeight: 500,
        fontSize: 11,
        fontStyle: 'italic',
    },
    completedTextTime: {
        marginLeft: 5,
        color: '#808080',
        fontWeight: 500,
        fontSize: 11,
        fontStyle: 'italic',
    },
    expiredAndCancelTextTime: {
        marginLeft: 5,
        color: '#FF4E45',
        fontWeight: 500,
        fontSize: 11,
        fontStyle: 'italic',
    },
    scheduleListEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyScheduleListImg: {
        height: 200,
    },
    emptyScheduleListText: {
        fontWeight: 400,
        fontSize: 13,
        color: 'rgba(128, 128, 128, 1)',
        textAlign: 'center',
    },
});

export default WorkSchedule;
