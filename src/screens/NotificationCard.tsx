import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Notification } from '../zustand/useNotificationStore';

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Card style={[styles.card, {
        backgroundColor: notification.read
          ? theme.colors.surface
          : theme.colors.elevation.level1,
      }]}>
        <Card.Content style={styles.content}>
          {/* Title with Time */}
          <View style={styles.headerRow}>
            <Text
              variant="titleMedium"
              style={[
                styles.title,
                {
                  color: theme.colors.onSurface,
                  fontWeight: '700',
                },
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text
              variant="labelSmall"
              style={[
                styles.timeAgo,
                {
                  color: theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {notification.timeAgo}
            </Text>
          </View>

          {/* Content */}
          <Text
            variant="bodySmall"
            style={[
              styles.content,
              {
                color: theme.colors.onSurface,
                marginVertical: 8,
              },
            ]}
            numberOfLines={2}
          >
            {notification.content}
          </Text>

          {/* Sender */}
          <Text
            variant="labelSmall"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: 'right',
              fontWeight: '600',
            }}
          >
            {notification.sender}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 8,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  timeAgo: {
    flexShrink: 1,
  },
});

export default NotificationCard;
