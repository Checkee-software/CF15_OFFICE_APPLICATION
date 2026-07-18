import React from 'react';
import {Modal, Text, TextInput, TouchableOpacity, View} from 'react-native';
import styles from '../styles';

type DatePickerModalProps = {
    showCreatedDatePicker: boolean;
    showFinishedDatePicker: boolean;
    datePickerDraft: string;
    datePickerError: string;
    setDatePickerDraft: (value: string) => void;
    setDatePickerError: (value: string) => void;
    closeDatePicker: () => void;
    submitDatePickerDraft: () => void;
    applyRelativeDate: (daysOffset: number) => void;
};

const DatePickerModal = React.memo(
    ({
        showCreatedDatePicker,
        showFinishedDatePicker,
        datePickerDraft,
        datePickerError,
        setDatePickerDraft,
        setDatePickerError,
        closeDatePicker,
        submitDatePickerDraft,
        applyRelativeDate,
    }: DatePickerModalProps) => {
        const isVisible = showCreatedDatePicker || showFinishedDatePicker;
        if (!isVisible) return null;

        return (
            <Modal
                visible
                transparent
                animationType='fade'
                onRequestClose={closeDatePicker}>
                <View style={styles.dateModalOverlay}>
                    <View style={styles.dateModalCard}>
                        <Text style={styles.dateModalTitle}>
                            {showCreatedDatePicker
                                ? 'Chọn ngày tạo văn bản'
                                : 'Chọn ngày kết thúc'}
                        </Text>
                        <TextInput
                            style={[
                                styles.dateModalInput,
                                !!datePickerError && styles.inputWrapError,
                            ]}
                            value={datePickerDraft}
                            placeholder='DD/MM/YYYY'
                            placeholderTextColor='#A0A0A0'
                            keyboardType='number-pad'
                            maxLength={10}
                            autoFocus
                            onChangeText={value => {
                                const digits = value
                                    .replace(/\D/g, '')
                                    .slice(0, 8);
                                const parts = [
                                    digits.slice(0, 2),
                                    digits.slice(2, 4),
                                    digits.slice(4, 8),
                                ].filter(Boolean);
                                setDatePickerDraft(parts.join('/'));
                                setDatePickerError('');
                            }}
                            onSubmitEditing={submitDatePickerDraft}
                        />
                        {!!datePickerError && (
                            <Text style={styles.dateModalError}>
                                {datePickerError}
                            </Text>
                        )}
                        <View style={styles.dateQuickRow}>
                            <TouchableOpacity
                                style={styles.dateQuickButton}
                                onPress={() => applyRelativeDate(0)}>
                                <Text style={styles.dateQuickText}>
                                    Hôm nay
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dateQuickButton}
                                onPress={() => applyRelativeDate(1)}>
                                <Text style={styles.dateQuickText}>
                                    Ngày mai
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateModalActions}>
                            <TouchableOpacity
                                style={styles.dateCancelButton}
                                onPress={closeDatePicker}>
                                <Text style={styles.dateCancelText}>Đóng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dateApplyButton}
                                onPress={submitDatePickerDraft}>
                                <Text style={styles.dateApplyText}>
                                    Chọn ngày
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    },
);

DatePickerModal.displayName = 'DatePickerModal';

export default DatePickerModal;
