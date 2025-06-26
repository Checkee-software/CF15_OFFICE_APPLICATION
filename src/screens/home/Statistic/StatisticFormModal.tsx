import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Platform,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
    visible: boolean;
    selectedType: string;
    setSelectedType: (type: string) => void;
    selectedTarget: string;
    setSelectedTarget: (target: string) => void;
    selectedTimeOption: string;
    setSelectedTimeOption: (time: string) => void;
    startDate: Date | null;
    setStartDate: (date: Date | null) => void;
    endDate: Date | null;
    setEndDate: (date: Date | null) => void;
    showStartPicker: boolean;
    setShowStartPicker: (show: boolean) => void;
    showEndPicker: boolean;
    setShowEndPicker: (show: boolean) => void;
    setVisible: (v: boolean) => void;
    onSubmit: () => void;
    showTypeDropdown: boolean;
    setShowTypeDropdown: (show: boolean) => void;
    showTargetDropdown: boolean;
    setShowTargetDropdown: (show: boolean) => void;
}

const StatisticFormModal = ({
    visible,
    selectedType,
    setSelectedType,
    selectedTarget,
    setSelectedTarget,
    selectedTimeOption,
    setSelectedTimeOption,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showStartPicker,
    setShowStartPicker,
    showEndPicker,
    setShowEndPicker,
    setVisible,
    onSubmit,
    showTypeDropdown,
    setShowTypeDropdown,
    showTargetDropdown,
    setShowTargetDropdown,
}: Props) => {
    const statisticTypes = ['Công việc', 'Sản phẩm', 'Đội sản xuất'];
    const statisticTargets = ['Lịch làm việc', 'Tất cả'];
    const timeOptions = ['Tháng này', 'Theo quý', 'Theo năm', 'Thủ công'];

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const updateManualTimeLabel = (start: Date | null, end: Date | null) => {
        if (start && end) {
            const format = (d: Date) =>
                `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            setSelectedTimeOption(
                `Thủ công: ${format(start)} - ${format(end)}`,
            );
        } else {
            setSelectedTimeOption('Thủ công');
        }
    };

    return (
        <Modal visible={visible} transparent animationType='slide'>
            <View style={styles.modalBackground}>
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Thống kê</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowTypeDropdown(!showTypeDropdown)}>
                        <Text style={styles.dropdownText}>
                            {selectedType || 'Chọn loại thống kê'}
                        </Text>
                        <Icon name='arrow-drop-down' size={20} />
                    </TouchableOpacity>
                    {showTypeDropdown &&
                        statisticTypes.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setSelectedType(item);
                                    setShowTypeDropdown(false);
                                }}>
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}

                    <TouchableOpacity
                        style={[styles.dropdown, {backgroundColor: '#e0e0e0'}]}
                        onPress={() =>
                            setShowTargetDropdown(!showTargetDropdown)
                        }>
                        <Text style={styles.dropdownText}>
                            {selectedTarget || 'Chọn'}
                        </Text>
                        <Icon name='arrow-drop-down' size={20} />
                    </TouchableOpacity>
                    {showTargetDropdown &&
                        statisticTargets.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setSelectedTarget(item);
                                    setShowTargetDropdown(false);
                                }}>
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}

                    <Text style={styles.formSubtitle}>Thời gian</Text>
                    <View style={styles.optionRow}>
                        {timeOptions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    selectedTimeOption.startsWith(item) &&
                                        styles.optionButtonSelected,
                                ]}
                                onPress={() => {
                                    setSelectedTimeOption(item);
                                    if (item === 'Thủ công') {
                                        updateManualTimeLabel(
                                            startDate,
                                            endDate,
                                        );
                                    }
                                }}>
                                <View style={styles.radioButtonContent}>
                                    <View
                                        style={[
                                            styles.radioOuter,
                                            selectedTimeOption.startsWith(
                                                item,
                                            ) && styles.radioOuterSelected,
                                        ]}>
                                        {selectedTimeOption.startsWith(
                                            item,
                                        ) && <View style={styles.radioInner} />}
                                    </View>
                                    <Text
                                        style={[
                                            styles.radioLabel,
                                            selectedTimeOption.startsWith(
                                                item,
                                            ) && styles.radioLabelSelected,
                                        ]}>
                                        {item}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {selectedTimeOption.startsWith('Thủ công') && (
                        <View style={styles.manualDateContainer}>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowStartPicker(true)}>
                                <Text style={styles.dateButtonText}>
                                    {startDate
                                        ? formatDate(startDate)
                                        : 'Bắt đầu'}
                                </Text>
                                <Icon
                                    name='calendar-month'
                                    size={16}
                                    color='#888'
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndPicker(true)}>
                                <Text style={styles.dateButtonText}>
                                    {endDate ? formatDate(endDate) : 'Kết thúc'}
                                </Text>
                                <Icon
                                    name='calendar-month'
                                    size={16}
                                    color='#888'
                                />
                            </TouchableOpacity>
                        </View>
                    )}

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate || new Date()}
                            mode='date'
                            onChange={(event, date) => {
                                setShowStartPicker(false);
                                if (date) {
                                    setStartDate(date);
                                    updateManualTimeLabel(date, endDate);
                                }
                            }}
                        />
                    )}
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate || new Date()}
                            mode='date'
                            onChange={(event, date) => {
                                setShowEndPicker(false);
                                if (date) {
                                    setEndDate(date);
                                    updateManualTimeLabel(startDate, date);
                                }
                            }}
                        />
                    )}

                    <View style={styles.formActions}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                {backgroundColor: '#ccc'},
                            ]}
                            onPress={() => setVisible(false)}>
                            <Text>Đóng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                {backgroundColor: '#4CAF50'},
                            ]}
                            onPress={() => {
                                setVisible(false);
                                onSubmit();
                            }}>
                            <Text style={{color: '#fff'}}>Thống kê</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default StatisticFormModal;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    formContainer: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dropdownText: {
        color: '#444',
    },
    dropdownItem: {
        padding: 10,
        backgroundColor: '#fff',
    },
    formSubtitle: {
        fontWeight: 'bold',
        marginVertical: 8,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    manualDateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        width: '48%',
    },
    dateButtonText: {
        color: '#000',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    optionButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        marginBottom: 10,
        width: '48%',
        alignItems: 'flex-start',
    },
    optionButtonSelected: {
        backgroundColor: '#4CAF504D',
        borderColor: '#4CAF50',
    },
    radioButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#999',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#4CAF50',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
    },
    radioLabel: {
        fontSize: 14,
        color: '#000',
        fontWeight: '400',
    },
    radioLabelSelected: {
        fontWeight: 'bold',
        color: '#000',
    },
});
