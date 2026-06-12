import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles';
import type { TDropdownListOption } from '../utils';

type DropdownModalProps = {
  visible: boolean;
  title?: string;
  options: TDropdownListOption[];
  selectedKeys?: string[];
  loading?: boolean;
  emptyText?: string;
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  onSelect?: (item: TDropdownListOption) => void;
  onClose: () => void;
};

const EMPTY_SELECTED_KEYS: string[] = [];

type DropdownListItemProps = {
  item: TDropdownListOption;
  checked: boolean;
  showCheckbox: boolean;
  onPress: (item: TDropdownListOption) => void;
};

const DropdownListItem = React.memo(({
  item,
  checked,
  showCheckbox,
  onPress,
}: DropdownListItemProps) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={handlePress}>
      <View style={styles.multiItemRow}>
        {showCheckbox ? (
          <MaterialCommunityIcons
            name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={18}
            color={checked ? '#4CAF50' : '#9A9A9A'}
          />
        ) : null}
        <View style={styles.dropdownItemContent}>
          <Text style={styles.dropdownItemText} numberOfLines={1}>{item.label}</Text>
          {!!item.subLabel && (
            <Text style={styles.dropdownItemSubText} numberOfLines={1}>{item.subLabel}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});
DropdownListItem.displayName = 'DropdownListItem';

const DropdownModal = React.memo(({
  visible,
  title,
  options,
  selectedKeys,
  loading = false,
  emptyText = 'Không có dữ liệu để chọn',
  searchEnabled,
  searchPlaceholder = 'Tìm kiếm...',
  onSelect,
  onClose,
}: DropdownModalProps) => {
  const [searchText, setSearchText] = useState('');
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    if (!visible) {
      setSearchText('');
    }
  }, [visible]);

  const selectedKeyList = selectedKeys ?? EMPTY_SELECTED_KEYS;
  const selectedKeySet = useMemo(() => new Set(selectedKeyList), [selectedKeyList]);
  const selectedKeySignature = useMemo(() => selectedKeyList.join('|'), [selectedKeyList]);
  const normalizedSearchText = useMemo(
    () => deferredSearchText.trim().toLocaleLowerCase('vi'),
    [deferredSearchText],
  );
  const shouldShowSearch = searchEnabled ?? options.length > 12;
  const filteredOptions = useMemo(() => {
    if (!normalizedSearchText) {
      return options;
    }

    return options.filter(item => {
      const searchableText =
        item.searchText ||
        `${item.label || ''} ${item.subLabel || ''}`.toLocaleLowerCase('vi');
      return searchableText.includes(normalizedSearchText);
    });
  }, [normalizedSearchText, options]);

  const handleSelect = useCallback((item: TDropdownListOption) => {
    if (onSelect) {
      onSelect(item);
      return;
    }
    item.onPress?.();
  }, [onSelect]);

  const keyExtractor = useCallback((item: TDropdownListOption) => item.key, []);

  const renderItem = useCallback(({ item }: { item: TDropdownListOption }) => {
    const checked = typeof item.checked === 'boolean'
      ? item.checked
      : selectedKeySet.has(item.key);
    const showCheckbox = typeof item.checked === 'boolean' || Array.isArray(selectedKeys);

    return (
      <DropdownListItem
        item={item}
        checked={checked}
        showCheckbox={showCheckbox}
        onPress={handleSelect}
      />
    );
  }, [handleSelect, selectedKeySet, selectedKeys]);

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
          {shouldShowSearch && !loading ? (
            <View style={styles.dropdownSearchWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color="#8A8A8A" />
              <TextInput
                style={styles.dropdownSearchInput}
                value={searchText}
                placeholder={searchPlaceholder}
                placeholderTextColor="#9A9A9A"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={setSearchText}
              />
              {!!searchText && (
                <TouchableOpacity
                  style={styles.dropdownSearchClear}
                  onPress={() => setSearchText('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#8A8A8A" />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          {loading ? (
            <View style={styles.dropdownStateRow}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.dropdownStateText}>
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOptions}
              style={styles.dropdownList}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={16}
              maxToRenderPerBatch={16}
              updateCellsBatchingPeriod={16}
              windowSize={7}
              removeClippedSubviews={Platform.OS === 'android'}
              extraData={selectedKeySignature}
              ListEmptyComponent={(
                <View style={styles.dropdownStateRow}>
                  <Text style={styles.dropdownStateText}>
                    {normalizedSearchText ? 'Không tìm thấy dữ liệu phù hợp' : emptyText}
                  </Text>
                </View>
              )}
              renderItem={renderItem}
            />
          )}
        </View>
      </View>
    </Modal>
  );
});
DropdownModal.displayName = 'DropdownModal';

export default DropdownModal;
