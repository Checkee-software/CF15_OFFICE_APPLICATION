/* eslint-disable react-hooks/exhaustive-deps */
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    Image,
    TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useHarvestStore} from '@/stores/harvestStore';
import {EHarvestStatus} from '@/shared-types/Response/HarvestResponse/HarvestResponse';
import colors from '@/assets/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import images from '@/assets/images';
import {TypeSchedulesHarvest} from '@/stores/harvestStore';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import moment from 'moment';
import Loading from '@/screens/subscreen/Loading';

const SchedulesHarvest = ({navigation}: any) => {
    const {schedulesHarvest, getListScheduleHarvest} = useHarvestStore();
    const [searchSchedule, setSearchSchedule] = useState<String>('');
    const [isLoading, setIsLoading] = useState<Boolean>(false);

    const filterData = schedulesHarvest.filter((item: TypeSchedulesHarvest) => {
        return item.title.toLowerCase().includes(searchSchedule.toLowerCase());
    });

    const handleGetSchedulesHarvest = async () => {
        setSearchSchedule('');
        setIsLoading(true);
        await getListScheduleHarvest();
        setIsLoading(false);
    };

    const handleNavigate = (_id: string) => {
        navigation.navigate(SCREEN_INFO.HARVEST_SCHEDULE_DETAIL.key, {
            _id: _id,
        });

        // if (
        //     userInfo.functions.some(
        //         (item: any) => item._id === 'SCHEDULE_HARVEST' && item.detail,
        //     )
        // ) {
        //     navigation.navigate(SCREEN_INFO.SCHEDULEDETAIL.key, {
        //         _id: itemHarvestSchedule._id,
        //     });
        // } else {
        //     Snackbar.show({
        //         text: 'Bạn không có quyền xem chi tiết quy trình thu hoạch',
        //         duration: Snackbar.LENGTH_SHORT,
        //     });
        // }
    };

    const renderItemScheduleHarvest = (item: TypeSchedulesHarvest) => (
        <TouchableOpacity
            style={styles.workCard}
            onPress={() => handleNavigate(item._id)}>
            <View style={styles.gap1}>
                <Text style={styles.mainWorkTitle}>{item.title}</Text>

                <View style={styles.warpChildTasksAndStaffs}>
                    <View style={styles.warpIconAndValueStaff}>
                        <FontAwesome6
                            name='user-group'
                            color={'#808080'}
                            size={14}
                        />

                        <Text style={styles.value}>
                            {item.totalParticipants}
                        </Text>
                    </View>
                </View>

                <View style={styles.workScheduleTime}>
                    <Text style={styles.remainingText}>
                        {(() => {
                            const now = moment();
                            const targetTime = moment(item.finishedDate);

                            const duration = moment.duration(
                                targetTime.diff(now),
                            );

                            const days = Math.floor(duration.asDays());
                            const hours = duration.hours();
                            const minutes = duration.minutes();

                            return (
                                <View style={styles.workScheduleTime}>
                                    <FontAwesome6
                                        name='clock'
                                        size={16}
                                        color={
                                            item.status ===
                                            EHarvestStatus.COMPLETED
                                                ? '#4CAF50'
                                                : item.status ===
                                                  EHarvestStatus.PROCESSING
                                                ? '#FF9800'
                                                : '#808080'
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.remainingText,
                                            item.status ===
                                            EHarvestStatus.COMPLETED
                                                ? styles.textColor1
                                                : item.status ===
                                                  EHarvestStatus.PROCESSING
                                                ? styles.textColor2
                                                : styles.textColor3,
                                        ]}>
                                        {duration.asMilliseconds() < 0 &&
                                        item.status ===
                                            EHarvestStatus.PROCESSING
                                            ? 'Trễ hạn'
                                            : duration.asMilliseconds() < 0 &&
                                              item.status ===
                                                  EHarvestStatus.COMPLETED
                                            ? 'Hoàn thành'
                                            : `Còn ${days} ngày, ${hours} giờ ${minutes} phút`}
                                    </Text>
                                </View>
                            );
                        })()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    useEffect(() => {
        handleGetSchedulesHarvest();
    }, []);

    if (isLoading) return <Loading />;

    return (
        <View style={styles.container}>
            <View style={styles.listWorkSchedule}>
                <View style={styles.searchInput}>
                    <View style={styles.warpIconTextInput}>
                        <MaterialIcons
                            name='search'
                            color={'rgba(128, 128, 128, 1)'}
                            size={22}
                        />
                        <TextInput
                            placeholder='Tìm quy trình thu hoạch...'
                            placeholderTextColor={colors.gray}
                            style={styles.input}
                            onChangeText={setSearchSchedule}
                        />
                    </View>
                </View>

                <FlatList
                    contentContainerStyle={styles.flatListSchedule}
                    data={filterData}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={item => item._id}
                    renderItem={({item}: {item: TypeSchedulesHarvest}) =>
                        renderItemScheduleHarvest(item)
                    }
                    onRefresh={handleGetSchedulesHarvest}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.scheduleListEmpty}>
                            <Image
                                source={images.emptyScheduleList}
                                style={styles.emptyScheduleListImg}
                                resizeMode='contain'
                            />
                            <Text style={styles.emptyScheduleListText}>
                                {searchSchedule.length !== 0
                                    ? `Không tìm thấy quy trình thu hoạch phù hợp với \n“${searchSchedule}"`
                                    : 'Không tìm thấy danh sách quy trình thu hoạch!'}
                            </Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};

export default SchedulesHarvest;

const styles = StyleSheet.create({
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
        flex: 1,
        gap: 20,
        paddingHorizontal: 20,
        marginVertical: 15,
    },
    searchInput: {
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#80808026',
        borderColor: colors.light_gray,
        borderWidth: 0.5,
        maxHeight: 54,
        height: 54,
    },
    warpIconTextInput: {
        paddingHorizontal: 10,
        width: '94%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        color: colors.black,
        width: '100%',
    },
    btnFilter: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
    },
    flatListSchedule: {
        flexGrow: 1,
        gap: 15,
        paddingBottom: 25,
    },
    workCard: {
        gap: 50,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        boxShadow: '0 1 2 0 #00000040',
    },
    progressValue: {
        color: 'black',
        fontWeight: '400',
        fontSize: 10,
    },
    warpInfoWork: {
        gap: 12,
        width: '100%',
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
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    warpIconAndValue: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    warpIconAndValueStaff: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    value: {
        color: '#808080',
        fontSize: 12,
        fontWeight: 500,
    },
    workScheduleTime: {
        gap: 4,
        flexDirection: 'row',
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
        fontSize: 12,
        fontStyle: 'italic',
    },
    textColor1: {
        color: '#4CAF50',
    },
    textColor2: {
        color: '#FF9800',
    },
    textColor3: {
        color: '#808080',
    },
    completedTextTime: {
        // marginLeft: 5,
        color: '#808080',
        fontWeight: 500,
        fontSize: 12,
        fontStyle: 'italic',
    },
    expiredAndCancelTextTime: {
        color: '#FF4E45',
        fontSize: 12,
        fontWeight: 500,
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
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        width: '94%',
        gap: 12,
    },
    text1: {
        fontWeight: 600,
    },
    warpDropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dropdown: {
        height: 52,
        minWidth: '100%',
        borderColor: '#9A9A9A',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    dropdown1: {
        height: 52,
        minWidth: '48%',
        borderColor: '#9A9A9A',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    placeholderStyle: {
        fontSize: 15,
        color: '#666666',
        fontWeight: 400,
    },
    selectedTextStyle: {
        fontSize: 15,
        fontWeight: 400,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    warpButton: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    btnModal: {
        alignItems: 'center',
        backgroundColor: '#D3D3D3',
        borderRadius: 10,
        padding: 12,
        flex: 1,
    },
    btnCloseModalText: {
        color: '#212121',
        fontWeight: 600,
        fontSize: 15,
    },
    gap1: {
        gap: 10,
    },
});
