/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
    Modal,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import StatisticResult from './StatisticResult';
import {useStatisticStore} from '../../../stores/statisticStore';
import Backdrop from '@/screens/subscreen/Loading/index2';
import moment from 'moment';
import Snackbar from 'react-native-snackbar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Dropdown} from 'react-native-element-dropdown';
import {EType} from '@/shared-types/form-data/StatisticFormData/StatisticFormData';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useAuthStore} from '@/stores/authStore';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

const Statistic = () => {
    const listStatisticTypeDefault = [
        {_id: 'WORK', name: 'Công việc'},
        {_id: 'PRODUCT', name: 'Sản phẩm'},
        {_id: 'GROUP', name: 'Đội sản xuất'},
    ];

    const {
        getStatistic,
        getListSelection,
        getGroupName,
        clearStatisticData,
        clearListSelection,
        isLoading,
        statisticData,
        listSelection,
    } = useStatisticStore();

    const {userInfo} = useAuthStore();

    const [listStatisticType, setListStatisticType] = useState<
        {_id: string; name: string}[]
    >([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState<EType | ''>('');
    const [selectedTarget, setSelectedTarget] = useState('');
    const [selectedTargetName, setSelectedTargetName] = useState('');

    const [selectedTimeOption, setSelectedTimeOption] = useState<string | null>(
        null,
    );
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const renderTimeStatistic = () => {
        if (selectedTimeOption === 'month') {
            return 'Tháng này';
        } else if (selectedTimeOption === 'quarter') {
            return 'Theo quý';
        } else if (selectedTimeOption === 'year') {
            return 'Theo năm';
        } else {
            return `${moment(startDate).format('DD/MM/YYYY')} - ${moment
                .utc(endDate)
                .format('DD/MM/YYYY')}`;
        }
    };

    const onChangeSelectedType = async (value: EType) => {
        if (
            value === 'GROUP' &&
            userInfo.userType.level === EOrganization.LEADER
        ) {
            setSelectedType('GROUP' as EType);
            await getGroupName(userInfo.groupId);
            setSelectedTarget(userInfo.groupId);
        } else {
            setSelectedType(value);
            await getListSelection(value);
            setSelectedTarget('');
            setSelectedTargetName('');
        }
    };

    const onChangeSelectedTarget = (value: any) => {
        setSelectedTarget(value._id);
        setSelectedTargetName(value.name);
    };

    const onChangeSelectedTime = (value: moment.unitOfTime.StartOf) => {
        let selectedStartDate: string | null = null;
        let selectedEndDate: string | null = null;

        if (value !== null) {
            selectedStartDate = moment()
                .startOf(value)
                .set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                })
                .add(7, 'hours')
                .toISOString();
            selectedEndDate = moment()
                .endOf(value)
                .set({
                    hour: 23,
                    minute: 59,
                    second: 59,
                    millisecond: 999,
                })
                .add(7, 'hours')
                .toISOString();
        }

        setSelectedTimeOption(value !== null ? value : 'manual');
        setStartDate(selectedStartDate);
        setEndDate(selectedEndDate);
    };

    const onChangeSelectedDatePicker = (type: string, date: Date) => {
        if (type === 'startDate') {
            const formatStartDate = moment(date)
                .set({
                    hour: 0,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                })
                .add(7, 'hours')
                .toISOString();
            setStartDate(formatStartDate);
            setShowStartDatePicker(!showStartDatePicker);
        } else {
            const formatEndDate = moment(date)
                .set({
                    hour: 23,
                    minute: 59,
                    second: 59,
                    millisecond: 999,
                })
                .add(7, 'hours')
                .toISOString();

            setEndDate(formatEndDate);
            setShowEndDatePicker(!showEndDatePicker);
        }
    };

    const handleGetStatistic = async () => {
        if (!selectedType || !startDate || !endDate) {
            Snackbar.show({
                text: 'Bạn hãy chọn đầy đủ các thông tin',
                duration: Snackbar.LENGTH_LONG,
            });
        } else {
            setShowForm(!showForm);

            await getStatistic({
                type: selectedType as EType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                targetId: selectedTarget,
            });
        }
    };

    useEffect(() => {
        if (!statisticData || listSelection.length !== 0) {
            clearStatisticData();
            clearListSelection();
        }

        const fetchData = async () => {
            if (userInfo.userType.level === EOrganization.LEADER) {
                setListStatisticType(
                    listStatisticTypeDefault.filter(
                        (item: any) => item._id !== 'PRODUCT',
                    ),
                );
            } else if (userInfo.userType.level === EOrganization.WORKER) {
                setListStatisticType(
                    listStatisticTypeDefault.filter(
                        (item: any) => item._id === 'WORK',
                    ),
                );
                setSelectedType('WORK' as EType);
                await getListSelection('WORK');
            } else {
                setListStatisticType(listStatisticTypeDefault);
            }
        };

        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            {statisticData === null ? (
                <View style={styles.emptyStatisticData}>
                    <TouchableOpacity
                        style={styles.btnQueryStatistic}
                        onPress={() => setShowForm(!showForm)}>
                        <View style={styles.warpIconText}>
                            <MaterialIcons
                                name='search'
                                size={22}
                                color={'#808080'}
                            />
                            <Text style={styles.btnQueryStatisticText}>
                                Nhấn để truy vấn thống kê
                            </Text>
                        </View>

                        <View style={styles.btnFilter}>
                            <MaterialIcons name='manage-search' size={22} />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.emptyStatisticDataText}>
                        Hãy truy vấn thông tin để xem thống kê!
                    </Text>
                </View>
            ) : (
                <ScrollView>
                    <View style={styles.listStatistic}>
                        <TouchableOpacity
                            style={styles.btnCurrentStatistic}
                            onPress={() => setShowForm(!showForm)}>
                            <Text style={styles.statisticTypeText}>
                                {selectedType === 'WORK'
                                    ? 'Công việc'
                                    : 'Sản phẩm'}
                            </Text>
                            <View style={styles.warpIconTextStatistic}>
                                <View style={{flexDirection: 'row', gap: 10}}>
                                    <MaterialIcons
                                        name='search'
                                        size={20}
                                        color={'#808080'}
                                    />
                                    <Text style={styles.statisticTargetText}>
                                        {selectedTargetName === ''
                                            ? 'Tất cả'
                                            : selectedTargetName}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.btnFilter,
                                        {backgroundColor: '#4CAF50'},
                                    ]}>
                                    <MaterialIcons
                                        name='manage-search'
                                        size={22}
                                        color={'#F5F5F5'}
                                    />
                                </View>
                            </View>
                            <Text
                                style={
                                    styles.statisticTimeText
                                }>{`Thời gian: ${renderTimeStatistic()}`}</Text>
                        </TouchableOpacity>

                        <StatisticResult />
                    </View>
                </ScrollView>
            )}

            <Modal visible={showForm} animationType='fade' transparent={true}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.text1}>Thống kê</Text>
                        <Dropdown
                            disable={
                                userInfo.userType.level === EOrganization.WORKER
                                    ? true
                                    : false
                            }
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            iconStyle={styles.iconStyle}
                            data={listStatisticType}
                            maxHeight={300}
                            labelField='name'
                            valueField='_id'
                            placeholder='Chọn loại thống kê'
                            value={selectedType}
                            onChange={itemValue =>
                                onChangeSelectedType(itemValue._id as EType)
                            }
                        />

                        <Dropdown
                            disable={
                                userInfo.userType.level ===
                                    EOrganization.LEADER &&
                                selectedType === 'GROUP'
                                    ? true
                                    : false
                            }
                            style={[
                                styles.dropdown,
                                listSelection.length !== 0
                                    ? {backgroundColor: '#f5f5f5'}
                                    : {backgroundColor: '#D3D3D3'},
                            ]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            iconStyle={styles.iconStyle}
                            data={listSelection}
                            maxHeight={300}
                            labelField='name'
                            valueField='_id'
                            placeholder='Chọn'
                            value={selectedTarget}
                            onChange={itemValue =>
                                onChangeSelectedTarget(itemValue)
                            }
                        />

                        <Text style={styles.text1}>Thời gian</Text>
                        <View style={styles.warpButton}>
                            <TouchableOpacity
                                style={[
                                    styles.selectDateBtnModal,
                                    selectedTimeOption === 'month'
                                        ? styles.selectedDateBtnModal
                                        : null,
                                ]}
                                onPress={() => onChangeSelectedTime('month')}>
                                <MaterialIcons
                                    name={
                                        selectedTimeOption === 'month'
                                            ? 'radio-button-checked'
                                            : 'radio-button-unchecked'
                                    }
                                    size={22}
                                    color={
                                        selectedTimeOption === 'month'
                                            ? '#4CAF50'
                                            : '#49454F'
                                    }
                                />
                                <Text style={styles.selectDateBtnModalText}>
                                    Tháng này
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.selectDateBtnModal,
                                    selectedTimeOption === 'quarter'
                                        ? styles.selectedDateBtnModal
                                        : null,
                                ]}
                                onPress={() => onChangeSelectedTime('quarter')}>
                                <MaterialIcons
                                    name={
                                        selectedTimeOption === 'quarter'
                                            ? 'radio-button-checked'
                                            : 'radio-button-unchecked'
                                    }
                                    size={22}
                                    color={
                                        selectedTimeOption === 'quarter'
                                            ? '#4CAF50'
                                            : '#49454F'
                                    }
                                />
                                <Text style={styles.selectDateBtnModalText}>
                                    Theo quý
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.warpButton}>
                            <TouchableOpacity
                                style={[
                                    styles.selectDateBtnModal,
                                    selectedTimeOption === 'year'
                                        ? styles.selectedDateBtnModal
                                        : null,
                                ]}
                                onPress={() => onChangeSelectedTime('year')}>
                                <MaterialIcons
                                    name={
                                        selectedTimeOption === 'year'
                                            ? 'radio-button-checked'
                                            : 'radio-button-unchecked'
                                    }
                                    size={22}
                                    color={
                                        selectedTimeOption === 'year'
                                            ? '#4CAF50'
                                            : '#49454F'
                                    }
                                />
                                <Text style={styles.selectDateBtnModalText}>
                                    Theo năm
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.selectDateBtnModal,
                                    selectedTimeOption === 'manual'
                                        ? styles.selectedDateBtnModal
                                        : null,
                                ]}
                                onPress={() => onChangeSelectedTime(null)}>
                                <MaterialIcons
                                    name={
                                        selectedTimeOption === 'manual'
                                            ? 'radio-button-checked'
                                            : 'radio-button-unchecked'
                                    }
                                    size={22}
                                    color={
                                        selectedTimeOption === 'manual'
                                            ? '#4CAF50'
                                            : '#49454F'
                                    }
                                />
                                <Text style={styles.selectDateBtnModalText}>
                                    Thủ công
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {selectedTimeOption === 'manual' ? (
                            <View style={styles.warpButton}>
                                <TouchableOpacity
                                    style={styles.optionBtnModal}
                                    onPress={() =>
                                        setShowStartDatePicker(
                                            !showStartDatePicker,
                                        )
                                    }>
                                    <Text style={styles.optionBtnModalText}>
                                        {startDate === null
                                            ? 'Bắt đầu'
                                            : moment(startDate).format(
                                                  'DD/MM/YYYY',
                                              )}
                                    </Text>
                                    <MaterialIcons
                                        name='calendar-month'
                                        size={21}
                                        color={'#888'}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.optionBtnModal}
                                    onPress={() =>
                                        setShowEndDatePicker(!showEndDatePicker)
                                    }>
                                    <Text style={styles.optionBtnModalText}>
                                        {endDate === null
                                            ? 'Kết thúc'
                                            : moment
                                                  .utc(endDate)
                                                  .format('DD/MM/YYYY')}
                                    </Text>
                                    <MaterialIcons
                                        name='calendar-month'
                                        size={21}
                                        color={'#888'}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        <View style={[styles.warpButton, {marginTop: 10}]}>
                            <TouchableOpacity
                                style={styles.btnModal}
                                onPress={() => setShowForm(!showForm)}>
                                <Text style={styles.btnCloseModalText}>
                                    Đóng
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.btnModal,
                                    {backgroundColor: '#4CAF50'},
                                ]}
                                onPress={() => handleGetStatistic()}>
                                <Text
                                    style={[
                                        styles.btnCloseModalText,
                                        {color: '#fff'},
                                    ]}>
                                    Thống kê
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate ? new Date(startDate) : new Date()}
                    mode='date'
                    onChange={(event, date) => {
                        if (date) {
                            onChangeSelectedDatePicker('startDate', date);
                        }
                    }}
                />
            )}

            {showEndDatePicker && (
                <DateTimePicker
                    value={endDate ? new Date(endDate) : new Date()}
                    mode='date'
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                        if (date) {
                            onChangeSelectedDatePicker('endDate', date);
                        }
                    }}
                />
            )}

            <Backdrop open={isLoading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    emptyStatisticData: {
        flex: 1,
        paddingHorizontal: 15,
    },
    btnQueryStatistic: {
        alignItems: 'center',
        paddingVertical: 10,
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        boxShadow: '0 1 2 0 #00000040',
        borderRadius: 12,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    warpIconText: {
        flexDirection: 'row',
        gap: 10,
    },
    btnQueryStatisticText: {
        fontWeight: 500,
    },
    btnFilter: {
        backgroundColor: '#FFFFFF',
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
    dropdown: {
        height: 52,
        minWidth: '100%',
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
        gap: 12,
    },
    selectDateBtnModal: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#808080',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        padding: 12,
        flex: 1,
    },
    selectedDateBtnModal: {
        borderColor: '#4CAF50',
        backgroundColor: '#c2e0c4',
    },
    selectDateBtnModalText: {
        fontWeight: 600,
        fontSize: 15,
    },
    optionBtnModal: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#9A9A9A',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        padding: 12,
        flex: 1,
    },
    optionBtnModalText: {
        color: '#666666',
        fontWeight: 400,
        fontSize: 15,
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
    emptyStatisticDataText: {
        color: '#808080',
        fontWeight: 500,
        fontSize: 15,
        textAlign: 'center',
        margin: 'auto',
    },
    listStatistic: {
        paddingHorizontal: 15,
        flex: 1,
    },
    btnCurrentStatistic: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        boxShadow: '0 1 2 0 #00000040',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    statisticTypeText: {
        fontSize: 13,
        fontWeight: 500,
        color: '#808080',
    },
    statisticTargetText: {
        fontWeight: 600,
    },
    warpIconTextStatistic: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statisticTimeText: {
        fontStyle: 'italic',
        color: '#4CAF50',
        fontWeight: 500,
        fontSize: 13,
    },
});

export default Statistic;
