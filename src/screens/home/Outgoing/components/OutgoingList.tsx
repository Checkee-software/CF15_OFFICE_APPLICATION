import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { EDocumentStatus } from '../components/constants';
import {
  OUTGOING_ALL_STATUSES_BY_LEVEL,
  OUTGOING_FILTER_ALL,
  OUTGOING_FILTERS,
  STATUS_COLOR,
} from '../components/constants';
import styles from '../styles';
import type { TLevelKey, TOutgoingItem } from '../types';

type TOutgoingListProps = {
  documents: TOutgoingItem[];
  levelKey: TLevelKey;
  onEdit: (item: TOutgoingItem) => void;
  onDelete: (item: TOutgoingItem) => void;
  onOpenDetail: (item: TOutgoingItem) => void;
  canMutateOutgoing: boolean;
  isLoading: boolean;
  isPreparingForm?: boolean;
};

type TOutgoingHeaderCreateButtonProps = {
  canMutateOutgoing: boolean;
  isCreating: boolean;
  isLoading: boolean;
  isPreparingForm: boolean;
  onCreate: () => void;
};

const isDraftStatus = (status: string, rawStatus?: string) => {
  const normalizedRawStatus = String(rawStatus || '').toUpperCase();
  return normalizedRawStatus === EDocumentStatus.DRAFT || status === 'Bản nháp';
};

const isRejectedStatus = (status: string, rawStatus?: string) => {
  const normalizedRawStatus = String(rawStatus || '').toUpperCase();
  return normalizedRawStatus === EDocumentStatus.REJECTED || status === 'Từ chối';
};

const isUpdatableStatus = (status: string, rawStatus?: string) => {
  return isDraftStatus(status, rawStatus) || isRejectedStatus(status, rawStatus);
};

const isDeletableStatus = (status: string, rawStatus?: string) => {
  return isDraftStatus(status, rawStatus) || isRejectedStatus(status, rawStatus);
};

export const OutgoingHeaderCreateButton = ({
  canMutateOutgoing,
  isCreating,
  isLoading,
  isPreparingForm,
  onCreate,
}: TOutgoingHeaderCreateButtonProps) => {
  if (!canMutateOutgoing || isCreating) {
    return null;
  }

  return (
    <TouchableOpacity
      accessibilityLabel="Tạo văn bản đi"
      accessibilityRole="button"
      disabled={isLoading || isPreparingForm}
      onPress={onCreate}
      style={[
        styles.headerCreateButton,
        (isLoading || isPreparingForm) && styles.headerCreateButtonDisabled,
      ]}>
      <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

export default function OutgoingList({
  documents,
  levelKey,
  onEdit,
  onDelete,
  onOpenDetail,
  canMutateOutgoing,
  isLoading,
  isPreparingForm = false,
}: TOutgoingListProps) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState(OUTGOING_FILTER_ALL);

  const filteredDocuments = useMemo(() => {
    const allowedStatusesByLevel = OUTGOING_ALL_STATUSES_BY_LEVEL[levelKey] || OUTGOING_ALL_STATUSES_BY_LEVEL.CBNV;
    return documents.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
      if (activeFilter === OUTGOING_FILTER_ALL) {
        return matchSearch && allowedStatusesByLevel.includes(item.status);
      }
      return matchSearch && item.status === activeFilter;
    });
  }, [activeFilter, documents, levelKey, searchText]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9A9A9A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm văn bản..."
            placeholderTextColor="#9A9A9A"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="tune-variant" size={20} color="#858585" />
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRowContent}>
          {OUTGOING_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.chip, activeFilter === filter && styles.chipActive]}
              onPress={() => setActiveFilter(filter)}>
              <Text style={[styles.chipText, activeFilter === filter && styles.chipTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.totalText}>Tổng số văn bản đi: {filteredDocuments.length}</Text>

      <FlatList
        data={filteredDocuments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const status = STATUS_COLOR[item.status] || STATUS_COLOR['Bản nháp'];
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => onOpenDetail(item)}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLeft}>Số hiệu: {item.code}</Text>
                <Text style={styles.metaRight}>{item.time}</Text>
              </View>
              <View style={styles.bottomRow}>
                <Text style={styles.stepText}>{item.step}</Text>
                <View style={styles.actionRow}>
                  {canMutateOutgoing && (
                    <>
                      {isUpdatableStatus(item.status, item.rawStatus) && (
                        <TouchableOpacity disabled={isLoading || isPreparingForm} onPress={() => onEdit(item)}>
                          <MaterialCommunityIcons name="pencil-outline" size={16} color="#2196F3" />
                        </TouchableOpacity>
                      )}
                      {isDeletableStatus(item.status, item.rawStatus) && (
                        <TouchableOpacity disabled={isLoading || isPreparingForm} onPress={() => onDelete(item)}>
                          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#F15B5B" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#9E9E9E" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
