import React from 'react';
import {
    Modal,
    StyleProp,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import styles from '../styles/styles';

type TDecisionModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    decisionType: 'reject' | 'approve';
    decisionNote: string;
    setDecisionNote: (value: string) => void;
    isSubmitting: boolean;
    title: string;
    confirmLabel: string;
    variant?: 'incoming' | 'outgoing';
    confirmButtonStyle?: StyleProp<ViewStyle>;
};

const DecisionModal = ({
    visible,
    onClose,
    onConfirm,
    decisionType,
    decisionNote,
    setDecisionNote,
    isSubmitting,
    title,
    confirmLabel,
    variant = 'outgoing',
    confirmButtonStyle,
}: TDecisionModalProps) => {
    const isIncoming = variant === 'incoming';
    const rejectInputColor = isIncoming ? '#F4DEDE' : '#FCE7E7';
    const rejectLabelColor = isIncoming ? '#FF4B4B' : '#F44336';

    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View
                    style={
                        isIncoming ? styles.modalCardIncoming : styles.modalCard
                    }>
                    <Text
                        style={
                            isIncoming
                                ? styles.modalTitleIncoming
                                : styles.modalTitle
                        }>
                        {title}
                    </Text>
                    {isIncoming ? <View style={styles.modalDivider} /> : null}
                    <Text
                        style={[
                            styles.modalLabel,
                            decisionType === 'reject' && {
                                color: rejectLabelColor,
                            },
                        ]}>
                        {decisionType === 'reject'
                            ? 'Nội dung từ chối'
                            : 'Nội dung đính kèm'}
                    </Text>
                    <TextInput
                        style={[
                            styles.modalInput,
                            decisionType === 'reject'
                                ? {backgroundColor: rejectInputColor}
                                : {backgroundColor: '#E8F3E8'},
                        ]}
                        placeholder='Nhập nội dung...'
                        value={decisionNote}
                        onChangeText={setDecisionNote}
                        multiline
                    />
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={onClose}
                            disabled={isSubmitting}>
                            <Text style={styles.backBtnText}>Quay lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.confirmBtn,
                                decisionType === 'reject'
                                    ? {backgroundColor: '#FF4B4B'}
                                    : {backgroundColor: '#47B24A'},
                                confirmButtonStyle,
                                isSubmitting && {opacity: 0.7},
                            ]}
                            onPress={onConfirm}
                            disabled={isSubmitting}>
                            <Text style={styles.confirmBtnText}>
                                {isSubmitting ? 'Đang xử lý...' : confirmLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DecisionModal;
