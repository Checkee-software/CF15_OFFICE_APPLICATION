import React, {useMemo} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import moment from 'moment';
import ENV from '@/config/ENV';
import images from '@/assets/images';

type SignedHistory = {
  _id?: string;
  fileName?: string;
  action?: string;
  signedAt?: string;
  createdAt?: string;
  fullName?: string;
  roleName?: string;
  avatarPath?: string;
};

type DisplayHistory = {
  id: string;
  fullName: string;
  roleName: string;
  description: string;
  actionLabel: string;
  actionColor: string;
  time: string;
  sortAt: number;
  avatarUri?: string;
};

const normalizeRoleName = (roleName?: string) => {
  const value = String(roleName || '').trim();
  return value || 'Chưa cập nhật chức vụ';
};

const formatTime = (value?: string) => {
  if (!value) {
    return '';
  }
  const parsed = moment(value);
  if (!parsed.isValid()) {
    return '';
  }
  return `Lúc ${parsed.format('HH:mm DD/MM/YYYY')}`;
};

const toSortAt = (value?: string) => {
  if (!value) {
    return 0;
  }
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const isInitialSignAction = (action?: string) => {
  const value = String(action || '').toUpperCase();
  return (
    value === 'SIGN' ||
    value === 'INITIAL_SIGN' ||
    value.includes('INITIAL_SIGN')
  );
};

const isApproveSignAction = (action?: string) => {
  const value = String(action || '').toUpperCase();
  return (
    value === 'APPROVE' ||
    value.includes('APPROV') ||
    value === 'SIGNING' ||
    value === 'MANAGER_SIGNING' ||
    value === 'DIRECTOR_SIGNING'
  );
};

const isSigningHistoryAction = (action?: string) =>
  isInitialSignAction(action) || isApproveSignAction(action);

const getActionMeta = (action?: string) =>
  isInitialSignAction(action)
    ? {label: 'Ký nháy', color: '#62B65F'}
    : {label: 'Ký duyệt', color: '#FFC567'};

const getAvatarUri = (avatarPath?: string) => {
  const normalizedPath = String(avatarPath || '').replace(/\\/g, '/').trim();
  return normalizedPath ? `${ENV.BACKEND_URL}${normalizedPath}` : undefined;
};

const DocumentApprovalHistory = ({route}: any) => {
  const items = useMemo<DisplayHistory[]>(() => {
    const signedHistories: SignedHistory[] = Array.isArray(
      route.params?.documentDetail?.signedHistories,
    )
      ? route.params.documentDetail.signedHistories
      : [];

    const histories = signedHistories
      .filter(item => isSigningHistoryAction(item.action))
      .map((item, index) => {
        const meta = getActionMeta(item.action);
        const actor = item.fullName || 'Người dùng';
        const actionText = meta.label.toLowerCase();
        const fileName = item.fileName
          ? ` văn bản ${item.fileName}`
          : ' văn bản';
        const signedAt = item.signedAt || item.createdAt;

        return {
          id: item._id || `signed-${index}`,
          fullName: actor,
          roleName: normalizeRoleName(item.roleName),
          description: `Mô tả: ${actor} đã ${actionText}${fileName}`,
          actionLabel: meta.label,
          actionColor: meta.color,
          time: formatTime(signedAt),
          sortAt: toSortAt(signedAt),
          avatarUri: getAvatarUri(item.avatarPath),
        };
      });

    const unique = new Map<string, DisplayHistory>();
    histories.forEach((item, index) => {
      const dedupeKey = `${item.fullName}|${item.roleName}|${item.actionLabel}|${item.time}|${item.description}`;
      if (!unique.has(dedupeKey)) {
        unique.set(dedupeKey, {...item, id: `${item.id}-${index}`});
      }
    });

    return Array.from(unique.values()).sort((a, b) => b.sortAt - a.sortAt);
  }, [route.params?.documentDetail?.signedHistories]);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Image
                source={item.avatarUri ? {uri: item.avatarUri} : images.avatar}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.headerText}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.role}>{item.roleName}</Text>
              </View>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.footer}>
              <Text style={[styles.badge, {backgroundColor: item.actionColor}]}>
                {item.actionLabel}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có lịch sử ký duyệt.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F2F2F2'},
  listContent: {padding: 12, gap: 10},
  card: {backgroundColor: '#E8E8E8', borderRadius: 12, padding: 12},
  headerRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  avatar: {width: 38, height: 38, borderRadius: 19, backgroundColor: '#D9D9D9'},
  headerText: {marginLeft: 10, flex: 1},
  name: {fontSize: 18, fontWeight: '700', color: '#1F2328'},
  role: {fontSize: 13, color: '#9B9B9B', marginTop: 2},
  description: {fontSize: 14, color: '#1F2328'},
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
  },
  time: {fontStyle: 'italic', fontSize: 12, color: '#9099A1'},
  empty: {marginTop: 20, textAlign: 'center', color: '#7B838C'},
});

export default DocumentApprovalHistory;
