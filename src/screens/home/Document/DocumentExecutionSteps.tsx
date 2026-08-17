import React, {useMemo} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import moment from 'moment';
import ENV from '@/config/ENV';
import images from '@/assets/images';

type StepInfo = {
  fullName?: string;
  roleName?: string;
  name?: string;
  comment?: string;
  action?: string;
  status?: string;
  stepOrder?: number;
  submitAt?: string;
  avatarPath?: string;
};

const STATUS_UI: Record<string, {label: string; bg: string; color: string}> = {
  DRAFT: {label: 'Bản nháp', bg: '#ECECEC', color: '#666666'},
  SENDING: {label: 'Gửi duyệt', bg: '#FFF0DD', color: '#F39C12'},
  MANAGER_INITIAL_SIGNING: {label: 'TP duyệt', bg: '#E5F8E8', color: '#4CAF50'},
  MANAGER_SIGNING: {label: 'TP duyệt', bg: '#E5F8E8', color: '#4CAF50'},
  MANAGER_APPROVING: {label: 'TP duyệt', bg: '#E5F8E8', color: '#4CAF50'},
  CLERK_CHECKING: {label: 'VT kiểm tra', bg: '#FFF5DF', color: '#FFB300'},
  DIRECTOR_INITIAL_SIGNING: {label: 'Phê duyệt', bg: '#E5F8E8', color: '#4CAF50'},
  DIRECTOR_SIGNING: {label: 'Phê duyệt', bg: '#E5F8E8', color: '#4CAF50'},
  DIRECTOR_APPROVING: {label: 'Phê duyệt', bg: '#E5F8E8', color: '#4CAF50'},
  READY_TO_PUBLISH: {label: 'Phát hành', bg: '#E3F0FF', color: '#42A5F5'},
  OFFICIAL_PUBLISHED: {label: 'Phát hành', bg: '#E3F0FF', color: '#42A5F5'},
  ARCHIVED: {label: 'Lưu trữ', bg: '#E9F8EC', color: '#81C784'},
  REJECTED: {label: 'Từ chối', bg: '#FFEAEA', color: '#FF6B6B'},
  STATIONARY_RECEIVED: {label: 'Tiếp nhận', bg: '#FFF0DD', color: '#F39C12'},
  MANAGEMENT_REVIEWING: {label: 'Đã duyệt', bg: '#E5F8E8', color: '#4CAF50'},
  REGISTERED: {label: 'Vào sổ', bg: '#E8F7EA', color: '#66BB6A'},
  ASSIGNED: {label: 'Phân công', bg: '#E3F0FF', color: '#42A5F5'},
  DEPARTMENT_RECEIVED: {label: 'Đang xử lý', bg: '#EAF4FF', color: '#42A5F5'},
  PROCESSING: {label: 'Đang xử lý', bg: '#EAF4FF', color: '#42A5F5'},
  COMPLETED: {label: 'Hoàn thành', bg: '#E8F7EA', color: '#4CAF50'},
};

const ACTION_TO_STATUS: Record<string, keyof typeof STATUS_UI> = {
  SUBMIT: 'SENDING',
  DIRECTOR_REVIEW: 'DIRECTOR_APPROVING',
  CHECK: 'CLERK_CHECKING',
  APPROVE: 'DIRECTOR_APPROVING',
  PUBLISH: 'READY_TO_PUBLISH',
  ARCHIVE: 'ARCHIVED',
  REJECT: 'REJECTED',
  STATIONARY_RECEIVE: 'STATIONARY_RECEIVED',
  REVIEW: 'MANAGEMENT_REVIEWING',
  TO_BOOK: 'REGISTERED',
  ASSIGN: 'ASSIGNED',
  DEPARTMENT_RECEIVE: 'DEPARTMENT_RECEIVED',
  PROCESS: 'PROCESSING',
  COMPLETE: 'COMPLETED',
};

const STEP_NAME_LABEL: Record<string, string> = {
  DRAFT: 'Bản nháp',
  SENDING: 'Gửi duyệt',
  MANAGER_INITIAL_SIGNING: 'TP duyệt',
  MANAGER_SIGNING: 'TP duyệt',
  MANAGER_APPROVING: 'TP duyệt',
  CLERK_CHECKING: 'VT kiểm tra',
  DIRECTOR_REVIEW: 'Phê duyệt',
  DIRECTOR_INITIAL_SIGNING: 'Phê duyệt',
  DIRECTOR_SIGNING: 'Phê duyệt',
  DIRECTOR_APPROVING: 'Phê duyệt',
  READY_TO_PUBLISH: 'Phát hành',
  OFFICIAL_PUBLISHED: 'Phát hành',
  ARCHIVED: 'Lưu trữ',
  REJECTED: 'Từ chối',
  STATIONARY_RECEIVE: 'Tiếp nhận',
  STATIONARY_RECEIVED: 'Tiếp nhận',
  REVIEW: 'Đã duyệt',
  MANAGEMENT_REVIEWING: 'Đã duyệt',
  TO_BOOK: 'Vào sổ',
  REGISTERED: 'Vào sổ',
  ASSIGN: 'Phân công',
  ASSIGNED: 'Phân công',
  DEPARTMENT_RECEIVE: 'Đang xử lý',
  DEPARTMENT_RECEIVED: 'Đang xử lý',
  PROCESS: 'Đang xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETE: 'Hoàn thành',
  COMPLETED: 'Hoàn thành',
};

const normalizeKey = (value?: string) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase();

const humanizeLabel = (value?: string) =>
  String(value || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

const DocumentExecutionSteps = ({route}: any) => {
  const stepsInfo = useMemo<StepInfo[]>(
    () => route.params?.stepsInfo || [],
    [route.params?.stepsInfo],
  );
  const sortedSteps = useMemo(
    () => [...stepsInfo].sort((a, b) => (b.stepOrder || 0) - (a.stepOrder || 0)),
    [stepsInfo],
  );

  const getStepStatusUI = (item: StepInfo) => {
    const statusKey = normalizeKey(item.status);
    if (STATUS_UI[statusKey]) {
      return STATUS_UI[statusKey];
    }

    const actionKey = normalizeKey(item.action);
    const mappedStatus = ACTION_TO_STATUS[actionKey];
    if (mappedStatus) {
      return STATUS_UI[mappedStatus];
    }

    return {label: humanizeLabel(item.action || item.status) || 'Cập nhật', bg: '#ECECEC', color: '#666666'};
  };

  const getStepName = (item: StepInfo) => {
    const name = String(item.name || '').trim();
    const nameLabel = STEP_NAME_LABEL[normalizeKey(name)];
    if (nameLabel) {
      return nameLabel;
    }

    const actionLabel = STEP_NAME_LABEL[normalizeKey(item.action)];
    if (!name && actionLabel) {
      return actionLabel;
    }

    return name || 'Duyệt văn bản';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedSteps}
        keyExtractor={(_, index) => `step-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => {
          const statusUI = getStepStatusUI(item);
          return (
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.userWrap}>
                  <Image
                    source={
                      item.avatarPath
                        ? {
                            uri: `${ENV.BACKEND_URL}${String(item.avatarPath).replace(
                              /\\/g,
                              '/',
                            )}`,
                          }
                        : (images.avatar || images.gardener)
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.userText}>
                    <Text style={styles.name}>{item.fullName || 'Người dùng'}</Text>
                    <Text style={styles.role}>
                      {item.roleName || 'Chưa cập nhật chức vụ'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.step}>Bước {item.stepOrder || 0}</Text>
              </View>

              <Text style={styles.task}>Tên bước: {getStepName(item)}</Text>
              <Text style={styles.description}>{item.comment || 'Không có ghi chú.'}</Text>

              <View style={styles.footer}>
                <View style={[styles.badge, {backgroundColor: statusUI.bg}]}>
                  <Text style={[styles.badgeText, {color: statusUI.color}]}>{statusUI.label}</Text>
                </View>
                <Text style={styles.time}>
                  {item.submitAt
                    ? `Lúc ${moment(item.submitAt).format('HH:mm DD/MM/YYYY')}`
                    : ''}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có dữ liệu các bước thực hiện.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F2F2F2'},
  listContent: {padding: 12, gap: 10},
  card: {backgroundColor: '#F7F7F7', borderRadius: 12, padding: 12},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  userWrap: {flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8},
  avatar: {width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#D9D9D9'},
  userText: {flex: 1},
  name: {fontSize: 18, fontWeight: '700', color: '#1F2328'},
  role: {fontSize: 13, color: '#7B838C', marginTop: 2},
  step: {color: '#F44336', fontWeight: '700'},
  task: {marginTop: 8, color: '#1F2328', fontWeight: '600'},
  description: {marginTop: 4, color: '#3C434A', fontSize: 13},
  footer: {marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  badge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6},
  badgeText: {fontSize: 12, fontWeight: '600'},
  time: {color: '#9099A1', fontStyle: 'italic'},
  empty: {marginTop: 20, textAlign: 'center', color: '#7B838C'},
});

export default DocumentExecutionSteps;
