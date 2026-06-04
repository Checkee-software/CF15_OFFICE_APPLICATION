import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Snackbar from 'react-native-snackbar';
import ENV from '@/config/ENV';
import axiosClient from '@/utils/axiosClient';
import images from '@/assets/images';
import { useAuthStore } from '@/stores/authStore';

type CommunicationItem = {
  _id?: string;
  fullName?: string;
  avatarPath?: string;
  role?: string;
  comment?: string;
  createdAt?: string;
  userId?: string;
};

const ROLE_LABEL_MAP: Record<string, string> = {
  MANAGEMENT: 'Ban giám đốc',
  STATIONARY: 'Văn thư',
  DEPARTMENT: 'Phòng ban',
  LEADER: 'Cán bộ nhân viên',
  WORKER: 'Người lao động',
  ADMIN: 'Admin',
};

const normalizeRole = (role?: string) => {
  const key = String(role || '').toUpperCase();
  return ROLE_LABEL_MAP[key] || role || 'Người dùng';
};

const normalizeItems = (items: any[]): CommunicationItem[] =>
  (Array.isArray(items) ? items : [])
    .map((item: any, index: number) => ({
      _id: item?._id || `cm-${index}`,
      fullName: item?.fullName || 'Người dùng',
      avatarPath: item?.avatarPath || '',
      role: item?.role || '',
      comment: item?.comment || '',
      createdAt: item?.createdAt,
      userId: item?.userId || item?.createdBy || '',
    }))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

const DocumentCommunication = ({ route, navigation }: any) => {
  const { userInfo } = useAuthStore();
  const documentId = route?.params?.documentId;
  const initialCommunication = route?.params?.communicationHistories;

  const [items, setItems] = useState<CommunicationItem[]>(normalizeItems(initialCommunication || []));
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    navigation?.setOptions?.({ title: 'Nội dung trao đổi' });
  }, [navigation]);

  const fetchCommunication = useCallback(async () => {
    if (!documentId) { return; }
    try {
      setIsLoading(true);
      const response = await axiosClient.get(`${ENV.BACKEND_URL}/resources/documents/detail/${documentId}`);
      const payload = response.data?.data;
      const docData = payload?.data ?? payload;
      const next = normalizeItems(docData?.communicationHistories || []);
      setItems(next);
    } catch (error: any) {
      Snackbar.show({
        text: error?.response?.data?.message || 'Không thể tải nội dung trao đổi!',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchCommunication();
  }, [fetchCommunication]);

  const canSend = useMemo(() => !!content.trim() && !isSending && !!documentId, [content, isSending, documentId]);

  const onSend = async () => {
    if (!canSend) { return; }
    try {
      setIsSending(true);
      await axiosClient.post(`${ENV.BACKEND_URL}/resources/documents/communicate/${documentId}`, {
        comment: content.trim(),
      });
      setContent('');
      await fetchCommunication();
      Snackbar.show({ text: 'Gửi trao đổi thành công!', duration: Snackbar.LENGTH_SHORT });
    } catch (error: any) {
      Snackbar.show({
        text: error?.response?.data?.message || 'Không thể gửi nội dung trao đổi!',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={84}>
        <View style={styles.listWrap}>
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size='large' color='#47B24A' />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item, index) => `${item._id || 'cm'}-${index}`}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isMine =
                  (!!item.userId && String(item.userId) === String(userInfo?._id || '')) ||
                  (!!item.fullName && String(item.fullName) === String(userInfo?.fullName || ''));
                const avatarUri = item.avatarPath ? `${ENV.BACKEND_URL}${String(item.avatarPath).replace(/\\/g, '/')}` : undefined;
                return (
                  <View style={[styles.card, isMine ? styles.cardMine : styles.cardOther]}>
                    <View style={styles.headerRow}>
                      <Image source={avatarUri ? { uri: avatarUri } : (images.avatar || images.gardener)} style={styles.avatar} />
                      <View style={styles.headerText}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{item.fullName || 'Người dùng'}</Text>
                          {isMine && <Text style={styles.youText}>Bạn</Text>}
                        </View>
                        <Text style={styles.role}>{normalizeRole(item.role)}</Text>
                      </View>
                    </View>

                    <Text style={styles.commentText}>{item.comment || ''}</Text>
                    <Text style={styles.timeText}>{item.createdAt ? `Lúc ${moment(item.createdAt).format('HH:mm DD/MM/YYYY')}` : ''}</Text>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>Chưa có nội dung trao đổi.</Text>}
            />
          )}
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            value={content}
            onChangeText={setContent}
            style={styles.input}
            placeholder='Nhập nội dung'
            placeholderTextColor='#A8A8A8'
            multiline
          />
          <TouchableOpacity style={[styles.sendButton, !canSend && { opacity: 0.6 }]} onPress={onSend} disabled={!canSend}>
            <Text style={styles.sendButtonText}>{isSending ? '...' : 'Gửi'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F3F3' },
  listWrap: { flex: 1 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 10, paddingBottom: 14, gap: 10 },
  card: { borderRadius: 12, padding: 10 },
  cardMine: { backgroundColor: '#DCEEFF' },
  cardOther: { backgroundColor: '#F6F6F6' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#D9D9D9' },
  headerText: { marginLeft: 8, flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 24 / 2, color: '#1F2328', fontWeight: '700' },
  youText: { fontSize: 12, color: '#2F8CFF' },
  role: { marginTop: 1, color: '#2F8CFF', fontSize: 12 },
  commentText: { marginTop: 8, color: '#2A2A2A', fontSize: 14, lineHeight: 20 },
  timeText: { marginTop: 8, textAlign: 'right', color: '#8C9196', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 24, color: '#8A8A8A' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 92,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8C8C8',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#1F2328',
  },
  sendButton: {
    height: 38,
    minWidth: 50,
    borderRadius: 19,
    backgroundColor: '#47B24A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DocumentCommunication;
