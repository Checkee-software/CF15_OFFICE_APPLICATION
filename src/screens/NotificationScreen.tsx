import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNotificationStore } from '../zustand/useNotificationStore';
import NotificationCard from './NotificationCard';
import NotificationEmptyState from './NotificationEmptyState';

type RootStackParamList = {
  NotificationScreen: undefined;
};

type NotificationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'NotificationScreen'
>;

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const { notifications, markAllAsRead } = useNotificationStore();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleMarkAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const hasNotifications = notifications.length > 0;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content
          title="THÔNG BÁO"
          titleStyle={{
            fontSize: 16,
            fontWeight: '700',
            alignSelf: 'center',
            flex: 1,
          }}
        />
        {hasNotifications && (
          <Appbar.Action
            icon="check-all"
            onPress={handleMarkAsRead}
            color={theme.colors.primary}
            accessibilityLabel="Đánh dấu đã đọc"
          />
        )}
      </Appbar.Header>

      {/* Body */}
      {hasNotifications ? (
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotificationCard notification={item} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <NotificationEmptyState />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingVertical: 8,
  },
});

export default NotificationScreen;
