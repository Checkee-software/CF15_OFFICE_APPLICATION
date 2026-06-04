import React from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles';
import type { TDropdownListOption } from '../utils';

type DropdownModalProps = {
  visible: boolean;
  title?: string;
  options: TDropdownListOption[];
  loading?: boolean;
  emptyText?: string;
  onClose: () => void;
};

const DropdownModal = React.memo(({
  visible,
  title,
  options,
  loading = false,
  emptyText = 'Không có dữ liệu để chọn',
  onClose,
}: DropdownModalProps) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      hardwareAccelerated
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.dropdownModalOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dropdownModalBackdrop}
          onPress={onClose}
        />
        <View style={styles.dropdownModalCard}>
          {!!title && <Text style={styles.dropdownModalTitle}>{title}</Text>}
          {loading ? (
            <View style={styles.dropdownStateRow}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.dropdownStateText}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <FlatList
              data={options}
              style={styles.dropdownList}
              keyExtractor={item => item.key}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              updateCellsBatchingPeriod={24}
              windowSize={4}
              removeClippedSubviews={Platform.OS === 'android'}
              ListEmptyComponent={(
                <View style={styles.dropdownStateRow}>
                  <Text style={styles.dropdownStateText}>{emptyText}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={item.onPress}>
                  <View style={styles.multiItemRow}>
                    {typeof item.checked === 'boolean' ? (
                      <MaterialCommunityIcons
                        name={item.checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={18}
                        color={item.checked ? '#4CAF50' : '#9A9A9A'}
                      />
                    ) : null}
                    <View style={styles.dropdownItemContent}>
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                      {!!item.subLabel && <Text style={styles.dropdownItemSubText}>{item.subLabel}</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
});
DropdownModal.displayName = 'DropdownModal';

export default DropdownModal;
