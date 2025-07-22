/* eslint-disable react-native/no-inline-styles */
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    Image,
    Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
// import * as Progress from 'react-native-progress';
import moment from 'moment';
import images from '../../../assets/images';
import {useWorkScheduleStore} from '../../../stores/workScheduleStore';
import {EScheduleStatus} from '@/shared-types/Response/ScheduleResponse/ScheduleResponse';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import Loading from '@/screens/subscreen/Loading';
import colors from '@/assets/colors';
import {Dropdown} from 'react-native-element-dropdown';
import Snackbar from 'react-native-snackbar';
import {useAuthStore} from '../../../stores/authStore';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

const WorkSchedule = ({navigation}: any) => {
    const {
        getListWorkSchedule,
        getProductType,
        getProduct,
        listWorkScheduleFilter,
        isLoading,
        filterByStatus,
        filterWorkSchedule,
        resetData,
        listProductType,
        listProduct,
    } = useWorkScheduleStore();

    const {userInfo} = useAuthStore();

    const statusList = [
        {label: 'Tất cả', value: 1},
        {label: 'Đang làm', value: 2},
        {label: 'Hoàn thành', value: 3},
        {label: 'Sắp hết hạn', value: 4},
        {label: 'Trễ hạn', value: 5},
        {label: 'Đang chờ', value: 6},
        {label: 'Đã huỷ', value: 7},
    ];

    const listMonth = [
        {_id: '1', name: 'Tháng 1'},
        {_id: '2', name: 'Tháng 2'},
        {_id: '3', name: 'Tháng 3'},
        {_id: '4', name: 'Tháng 4'},
        {_id: '5', name: 'Tháng 5'},
        {_id: '6', name: 'Tháng 6'},
        {_id: '7', name: 'Tháng 7'},
        {_id: '8', name: 'Tháng 8'},
        {_id: '9', name: 'Tháng 9'},
        {_id: '10', name: 'Tháng 10'},
        {_id: '11', name: 'Tháng 11'},
        {_id: '12', name: 'Tháng 12'},
    ];

    const generateYears = (startYear = 2020) => {
        const currentYear = new Date().getFullYear();
        const years = [];

        for (let year = startYear; year <= currentYear; year++) {
            years.push({
                _id: year.toString(),
                name: year.toString(),
            });
        }

        return years;
    };

    const listYear = generateYears();

    const [selectedStatus, setSelectedStatus] = useState(1);
    const [searchSchedule, setSearchSchedule] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedProductType, setSelectedProductType] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    // const renderCircleColor = (status: string) => {
    //     switch (status) {
    //         case EScheduleStatus.PROCESSING:
    //         case EScheduleStatus.ALMOST_EXPIRE:
    //         case EScheduleStatus.EXPIRED:
    //             return '#2196F3';

    //         case EScheduleStatus.COMPLETED:
    //             return '#4CAF50';

    //         case EScheduleStatus.CANCELED:
    //             return '#FF4E45';

    //         default:
    //             return undefined;
    //     }
    // };

    const handleNavigate = (itemWorkSchedule: any) => {
        if (userInfo.userType.level === EOrganization.WORKER) {
            navigation.navigate(SCREEN_INFO.SCHEDULEDETAIL.key, {
                _id: itemWorkSchedule._id,
            });
        } else {
            if (
                userInfo.functions.some(
                    (item: any) => item._id === 'SCHEDULE' && item.detail,
                )
            ) {
                navigation.navigate(SCREEN_INFO.SCHEDULEDETAIL.key, {
                    _id: itemWorkSchedule._id,
                });
            } else {
                Snackbar.show({
                    text: 'Bạn không có quyền xem chi tiết lịch sử quy trình',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        }
    };

    const renderStatusTitle = (status: string) => {
        switch (status) {
            case EScheduleStatus.PENDING:
                return (
                    <Text style={styles.pendingAndAlmostExpireText}>
                        Đang chờ
                    </Text>
                );

            case EScheduleStatus.PROCESSING:
                return (
                    <Text style={styles.processingText}>Đang thực hiện</Text>
                );

            case EScheduleStatus.COMPLETED:
                return <Text style={styles.completedText}>Hoàn thành</Text>;

            case EScheduleStatus.ALMOST_EXPIRE:
                return (
                    <Text style={styles.pendingAndAlmostExpireText}>
                        Sắp hết hạn
                    </Text>
                );

            case EScheduleStatus.EXPIRED:
                return (
                    <Text style={styles.expiredAndCanceledText}>Trễ hạn</Text>
                );

            case EScheduleStatus.CANCELED:
                return (
                    <Text style={styles.expiredAndCanceledText}>Từ chối</Text>
                );

            default:
                return null;
        }
    };

    // const calculateTotalPercent = (taskItem: any) => {
    //     const tasks = taskItem?.childTasks.tasks;
    //     const totalTasks = tasks?.length;

    //     const completedTasks = tasks
    //         ? tasks.filter(
    //               (task: any) => task.status === EScheduleStatus.COMPLETED,
    //           ).length
    //         : 0;

    //     const overallProgress = totalTasks
    //         ? (completedTasks / totalTasks) * 100
    //         : 0;

    //     const overallProgressFormat = overallProgress / 100;

    //     return overallProgressFormat;
    // };

    const renderWorkSchedule = (
        status: string,
        startedDate: string,
        finishedDate: string,
    ) => {
        const targetTime = moment(finishedDate);
        const now = moment();

        // Tính khoảng cách ngày kết thúc
        const duration = moment.duration(targetTime.diff(now));

        // chuyển ngày bắt đầu sang giờ Việt Nam
        const startedDateVN = moment.utc(startedDate).add(7, 'hours');
        const nowVN = moment().utcOffset(7);

        // tính khoảng cách ngày bắt đầu
        const durationStartedDateVN = moment.duration(
            startedDateVN.diff(nowVN),
        );

        // tách thành ngày, giờ, phút
        const startedDays = Math.floor(durationStartedDateVN.asDays());
        const startedHours = durationStartedDateVN.hours();
        const startedMinutes = durationStartedDateVN.minutes();

        // tạo chuỗi kết quả
        let resultstartedDays = 'Bắt đầu sau ';
        if (startedDays > 0) resultstartedDays += `${startedDays} ngày, `;
        if (startedHours > 0 || startedDays > 0)
            resultstartedDays += `${startedHours} giờ, `;
        resultstartedDays += `${startedMinutes} phút`;

        // Nếu thời gian đã trễ
        if (
            duration.asMilliseconds() < 0 &&
            status !== EScheduleStatus.COMPLETED
        ) {
            return (
                <Text
                    style={[
                        styles.expiredAndCancelTextTime,
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
                    <View style={styles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#FF9800'}
                        />

                        <Text style={styles.startInText}>
                            {resultstartedDays}
                        </Text>
                    </View>
                );

            case EScheduleStatus.PROCESSING:
            case EScheduleStatus.ALMOST_EXPIRE:
                return (
                    <View style={styles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#808080'}
                        />

                        <Text style={styles.remainingText}>
                            {`Còn ${days} ngày, ${hours} giờ ${minutes} phút`}
                        </Text>
                    </View>
                );

            case EScheduleStatus.COMPLETED:
                return (
                    <View style={styles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#808080'}
                        />

                        <Text style={styles.completedTextTime}>
                            {`Hoàn thành lúc ${hour}, ${day}`}
                        </Text>
                    </View>
                );

            case EScheduleStatus.EXPIRED:
                return (
                    <View style={styles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#FF4E45'}
                        />

                        <Text style={styles.expiredAndCancelTextTime}>
                            {`Hơn ${hours} giờ ${minutes} phút`}
                        </Text>
                    </View>
                );

            case EScheduleStatus.CANCELED:
                return (
                    <View style={styles.workScheduleTime}>
                        <FontAwesome6
                            name='clock'
                            size={16}
                            color={'#FF4E45'}
                        />

                        <Text style={styles.expiredAndCancelTextTime}>
                            {`Đã từ chối lúc ${hour}, ${day}`}
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

    const additionalFilter = () => {
        if (
            !selectedMonth &&
            !selectedYear &&
            !selectedProductType &&
            !selectedProduct
        ) {
            Snackbar.show({
                text: 'Hãy chọn một trường để lọc',
                duration: Snackbar.LENGTH_LONG,
            });
        } else {
            if (selectedMonth !== '' && selectedYear === '') {
                const currentYear = moment().year();

                const startDate = moment({
                    year: currentYear,
                    month: Number(selectedMonth) - 1,
                    day: 1,
                }).format('DD/MM/YYYY');

                const endDate = moment({
                    year: currentYear,
                    month: Number(selectedMonth) - 1,
                })
                    .endOf('month')
                    .format('DD/MM/YYYY');

                filterWorkSchedule(
                    startDate,
                    endDate,
                    selectedProductType,
                    selectedProduct,
                );
            } else if (selectedMonth === '' && selectedYear !== '') {
                const startDate = moment({
                    year: Number(selectedYear),
                    month: 0,
                    day: 1,
                }).format('DD/MM/YYYY');

                const endDate = moment({
                    year: Number(selectedYear),
                    month: 11,
                })
                    .endOf('month')
                    .format('DD/MM/YYYY');

                filterWorkSchedule(
                    startDate,
                    endDate,
                    selectedProductType,
                    selectedProduct,
                );
            } else {
                const startDate = moment({
                    year: Number(selectedYear),
                    month: Number(selectedMonth) - 1,
                    day: 1,
                }).format('DD/MM/YYYY');

                const endDate = moment({
                    year: Number(selectedYear),
                    month: Number(selectedMonth) - 1,
                })
                    .endOf('month')
                    .format('DD/MM/YYYY');

                filterWorkSchedule(
                    startDate,
                    endDate,
                    selectedProductType,
                    selectedProduct,
                );
            }
            setShowForm(!showForm);
        }
    };

    const resetFilter = () => {
        resetData();
        setSelectedMonth('');
        setSelectedYear('');
        setSelectedProductType('');
        setSelectedProduct('');
        setShowForm(!showForm);
    };

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
        <TouchableOpacity
            style={styles.workCard}
            onPress={() => handleNavigate(itemWorkSchedule)}>
            <View>
                {/* <Progress.Circle
                    size={40}
                    color={renderCircleColor(itemWorkSchedule.status)}
                    progress={calculateTotalPercent(itemWorkSchedule)} // Từ 0.0 đến 1.0
                    formatText={() =>
                        `${Math.round(
                            calculateTotalPercent(itemWorkSchedule) * 100,
                        )}%`
                    }
                    showsText={true}
                    textStyle={styles.progressValue}
                    unfilledColor={'rgba(211, 211, 211, 1)'}
                    borderWidth={0}
                /> */}

                <View style={styles.warpInfoWork}>
                    {renderStatusTitle(itemWorkSchedule.status)}

                    <Text style={styles.mainWorkTitle}>
                        {itemWorkSchedule.title}
                    </Text>

                    <View style={styles.warpChildTasksAndStaffs}>
                        <View style={styles.warpIconAndValue}>
                            <MaterialIcons
                                name='checklist-rtl'
                                color={'#808080'}
                                size={20}
                            />

                            <Text style={styles.value}>
                                {`${itemWorkSchedule.childTasks.reduce(
                                    (count: number, staffItem: any) => {
                                        return staffItem.status ===
                                            EScheduleStatus.COMPLETED
                                            ? count + 1
                                            : count;
                                    },
                                    0,
                                )}/${itemWorkSchedule.childTasks.length}`}
                            </Text>
                        </View>

                        <View style={styles.warpIconAndValueStaff}>
                            <FontAwesome6
                                name='user-group'
                                color={'#808080'}
                                size={14}
                            />

                            <Text style={styles.value}>
                                {itemWorkSchedule.employees.length}
                            </Text>
                        </View>
                    </View>

                    {renderWorkSchedule(
                        itemWorkSchedule.status,
                        itemWorkSchedule.startedDate,
                        itemWorkSchedule.finishedDate,
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleGetListWorkSchedule = async () => {
        resetData();
        await getListWorkSchedule();
        getProductType();
        getProduct();
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
        <View style={styles.container}>
            <View style={styles.workScheduleTypeHorizontalScroll}>
                <FlatList
                    data={statusList}
                    horizontal
                    keyboardShouldPersistTaps='handled'
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.label}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => selectScheduleType(item.value)}
                            style={[
                                styles.statusBtn,
                                selectedStatus === item.value &&
                                    styles.selectedStatusBtn,
                            ]}>
                            <Text
                                style={[
                                    styles.statusBtnText,
                                    selectedStatus === item.value &&
                                        styles.selectedStatusBtnText,
                                ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.listWorkSchedule}>
                <View style={styles.searchInput}>
                    <View style={styles.warpIconTextInput}>
                        <MaterialIcons
                            name='search'
                            color={'rgba(128, 128, 128, 1)'}
                            size={22}
                        />
                        <TextInput
                            placeholder='Tìm quy trình'
                            placeholderTextColor={colors.gray}
                            style={styles.input}
                            onChangeText={setSearchSchedule}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.btnFilter}
                        onPress={() => setShowForm(!showForm)}>
                        <MaterialIcons
                            name='manage-search'
                            color={'#fff'}
                            size={22}
                        />
                    </TouchableOpacity>
                </View>

                <FlatList
                    contentContainerStyle={styles.flatListSchedule}
                    data={filterSchedule}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => renderItemWorkSchedule(item)}
                    onRefresh={handleGetListWorkSchedule}
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
                                    ? `Không tìm thấy lịch công việc phù hợp với \n“${searchSchedule}"`
                                    : 'Không tìm thấy danh sách lịch công việc!'}
                            </Text>
                        </View>
                    }
                />
            </View>

            <Modal visible={showForm} animationType='fade' transparent={true}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.text1}>Lọc quy trình</Text>

                        <View style={styles.warpDropdown}>
                            <Dropdown
                                style={styles.dropdown1}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                iconStyle={styles.iconStyle}
                                data={listMonth}
                                maxHeight={300}
                                labelField='name'
                                valueField='_id'
                                placeholder='Chọn tháng'
                                value={selectedMonth}
                                onChange={itemValue =>
                                    setSelectedMonth(itemValue._id)
                                }
                            />

                            <Dropdown
                                mode='modal'
                                style={styles.dropdown1}
                                search
                                searchPlaceholder='Tìm năm'
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                iconStyle={styles.iconStyle}
                                data={listYear}
                                maxHeight={300}
                                labelField='name'
                                valueField='_id'
                                placeholder='Chọn năm'
                                value={selectedYear}
                                onChange={itemValue =>
                                    setSelectedYear(itemValue._id)
                                }
                            />
                        </View>

                        <Dropdown
                            mode='modal'
                            style={styles.dropdown}
                            search
                            searchPlaceholder='Tìm loại cây trồng'
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            iconStyle={styles.iconStyle}
                            data={listProductType}
                            maxHeight={300}
                            labelField='name'
                            valueField='_id'
                            placeholder='Chọn loại cây trồng'
                            value={selectedProductType}
                            onChange={itemValue =>
                                setSelectedProductType(itemValue._id)
                            }
                        />

                        <Dropdown
                            mode='modal'
                            style={styles.dropdown}
                            search
                            searchPlaceholder='Tìm cây trồng'
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            iconStyle={styles.iconStyle}
                            data={listProduct}
                            maxHeight={300}
                            labelField='name'
                            valueField='_id'
                            placeholder='Chọn cây trồng'
                            value={selectedProduct}
                            onChange={itemValue =>
                                setSelectedProduct(itemValue._id)
                            }
                        />

                        <View style={styles.warpButton}>
                            <TouchableOpacity
                                style={[
                                    styles.btnModal,
                                    {backgroundColor: '#4CAF50'},
                                ]}
                                onPress={additionalFilter}>
                                <Text
                                    style={[
                                        styles.btnCloseModalText,
                                        {color: '#fff'},
                                    ]}>
                                    Lọc
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.btnModal,
                                    {backgroundColor: '#FF4E45'},
                                ]}
                                onPress={resetFilter}>
                                <Text
                                    style={[
                                        styles.btnCloseModalText,
                                        {color: '#fff'},
                                    ]}>
                                    Đặt lại
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnModal}
                                onPress={() => setShowForm(!showForm)}>
                                <Text style={styles.btnCloseModalText}>
                                    Đóng
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

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
        backgroundColor: colors.white,
        borderColor: colors.light_gray,
        borderWidth: 0.5,
        maxHeight: 54,
        height: 54,
    },
    warpIconTextInput: {
        paddingHorizontal: 10,
        width: '85%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        color: colors.black,
        width: '85%',
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
    },
    workCard: {
        gap: 12,
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
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
        justifyContent: 'flex-end',
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
});

export default WorkSchedule;
