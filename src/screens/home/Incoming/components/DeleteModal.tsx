import React from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import styles from '../styles';

type DeleteModalProps = {
    visible: boolean;
    deletingTitle: string;
    isDeleting: boolean;
    isLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const DeleteModal = React.memo(
    ({
        visible,
        deletingTitle,
        isDeleting,
        isLoading,
        onCancel,
        onConfirm,
    }: DeleteModalProps) => {
        if (!visible) return null;

        return (
            <Modal visible={visible} transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Xóa văn bản đến</Text>
                        <Text style={styles.modalMessage}>
                            Bạn có chắc chắn muốn xóa văn bản đến này không?
                        </Text>
                        <Text style={styles.modalDocTitle}>
                            {deletingTitle || 'Văn bản đến'}
                        </Text>
                        <View style={styles.modalWarningWrap}>
                            <Text style={styles.modalWarningText}>
                                Tất cả dữ liệu trong văn bản đến này sẽ xóa bỏ
                                hoàn toàn!
                            </Text>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalBtnGhost}
                                disabled={isDeleting || isLoading}
                                onPress={onCancel}>
                                <Text style={styles.modalBtnGhostText}>
                                    Hủy bỏ
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalBtnDanger,
                                    (isDeleting || isLoading) && {opacity: 0.7},
                                ]}
                                disabled={isDeleting || isLoading}
                                onPress={onConfirm}>
                                <Text style={styles.modalBtnDangerText}>
                                    {isDeleting
                                        ? 'Đang xóa...'
                                        : 'Chắc chắn xóa'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    },
);

DeleteModal.displayName = 'DeleteModal';

export default DeleteModal;
