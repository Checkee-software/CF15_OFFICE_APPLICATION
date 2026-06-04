import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles';
import {
  STATUS_COLOR,
  canDeleteIncomingByStatus,
  formatDateTime,
  getIncomingCardAction,
  type TFormMode,
  type TIncomingItem,
} from '../utils';

type DocumentCardProps = {
  item: TIncomingItem;
  isStationary: boolean;
  isBusy: boolean;
  onOpenDetail: (id: string) => void;
  onStartEdit: (id: string, forcedMode?: Exclude<TFormMode, 'CREATE'>) => void;
  onRequestDelete: (id: string, title: string) => void;
};

const DocumentCard = React.memo(({
  item,
  isStationary,
  isBusy,
  onOpenDetail,
  onStartEdit,
  onRequestDelete,
}: DocumentCardProps) => {
  const status = STATUS_COLOR[item.statusLabel] || STATUS_COLOR['Bản nháp'];
  const cardAction = getIncomingCardAction(item.rawStatus);
  const canEdit = isStationary && cardAction.isEditable;
  const canDelete = isStationary && canDeleteIncomingByStatus(item.rawStatus);
  const updateLabel = canEdit ? (cardAction.nextActionLabel || 'Cập nhật') : '';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onOpenDetail(item.id)}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{item.statusLabel}</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>Số hiệu: {item.code || '--'}</Text>
        <Text style={styles.metaRight}>{formatDateTime(item.createdAt)}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.stepText}>
          {item.finishedAt ? `Kết thúc vào ${formatDateTime(item.finishedAt)}` : '...'}
        </Text>
        <View style={styles.actionRow}>
          {canEdit && updateLabel ? (
            <>
              <TouchableOpacity
                style={[styles.updateActionButton, isBusy && styles.updateActionButtonDisabled]}
                disabled={isBusy}
                onPress={(event: any) => {
                  event?.stopPropagation?.();
                  onStartEdit(item.id, cardAction.forcedMode);
                }}>
                <Text style={styles.updateActionButtonText}>{updateLabel}</Text>
              </TouchableOpacity>
              {canDelete && (
                <TouchableOpacity
                  disabled={isBusy}
                  onPress={(event: any) => {
                    event?.stopPropagation?.();
                    onRequestDelete(item.id, item.title || '');
                  }}>
                  <MaterialCommunityIcons name="trash-can-outline" size={16} color="#F15B5B" />
                </TouchableOpacity>
              )}
            </>
          ) : null}
          <MaterialCommunityIcons name="chevron-right" size={18} color="#9E9E9E" />
        </View>
      </View>
    </TouchableOpacity>
  );
});

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;
