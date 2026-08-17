import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export type DeleteModalType = 'folder' | 'document';

interface DeleteModalProps {
  visible: boolean;
  itemName: string;
  itemType: DeleteModalType;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const isFolder = itemType === 'folder';
  const warningMessage = isFolder
    ? 'Tất cả dữ liệu trong hồ sơ này sẽ xóa bỏ hoàn toàn!'
    : 'Tất cả dữ liệu trong văn bản đi này sẽ xóa bỏ hoàn toàn!';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <Text style={styles.modalTitle}>
            {isFolder ? 'Xóa hồ sơ' : 'Xóa văn bản'}
          </Text>

          <View style={styles.divider} />

          {/* Content */}
          <View style={styles.contentSection}>
            <Text style={styles.confirmQuestion}>
              {isFolder
                ? 'Bạn có chắc chắn muốn xóa hồ sơ này không?'
                : 'Bạn có chắc chắn muốn xóa văn bản đi này không?'}
            </Text>

            <Text style={styles.itemName}>{itemName}</Text>

            {/* Warning Message */}
            <View style={styles.warningSection}>
              <Text style={styles.warningText}>{warningMessage}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isLoading}>
              <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Chắc chắn xóa</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingVertical: 18,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    width: '100%',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  confirmQuestion: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  warningSection: {
    backgroundColor: '#FFEBEB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#FFCDCD',
    width: '100%',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF4D4D',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#D1D1D6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF4D49',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DeleteModal;
