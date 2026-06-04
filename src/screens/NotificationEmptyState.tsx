import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const NotificationEmptyState: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="bell-off"
          size={80}
          color={theme.colors.outline}
        />
      </View>
      <Text
        variant="titleMedium"
        style={[
          styles.emptyText,
          {
            color: theme.colors.onSurface,
          },
        ]}
      >
        Hiện tại bạn không có thông báo nào!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default NotificationEmptyState;
