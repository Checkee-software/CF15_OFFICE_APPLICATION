/**
 * Example usage of NotificationScreen and useNotificationStore
 * 
 * You can use this as reference to integrate the notification screen into your app
 */

import { useNotificationStore } from '../zustand/useNotificationStore';

export const useNotificationExample = () => {
  const { addNotification, markAllAsRead, clearAll } = useNotificationStore();

  // Example: Add a notification
  const addExampleNotification = () => {
    addNotification({
      id: `notif_${Date.now()}`,
      title: 'Công việc con',
      content: 'Bạn được giao một công việc mới. Vui lòng xem chi tiết.',
      sender: 'NGUYỄN VĂN HOÀI',
      timeAgo: '3 phút trước',
      timestamp: Date.now(),
      read: false,
    });
  };

  // Example: Mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Example: Clear all notifications
  const handleClearAll = () => {
    clearAll();
  };

  return {
    addExampleNotification,
    handleMarkAllAsRead,
    handleClearAll,
  };
};

/**
 * Example integration in your navigation stack:
 * 
 * import NotificationScreen from '../screens/NotificationScreen';
 * 
 * // In your Navigator:
 * <Stack.Screen 
 *   name="NotificationScreen" 
 *   component={NotificationScreen}
 *   options={{
 *     headerShown: false,
 *   }}
 * />
 * 
 * // Navigate to it:
 * navigation.navigate('NotificationScreen');
 */

/**
 * Example usage in a component:
 * 
 * import { useNotificationStore } from '../zustand/useNotificationStore';
 * 
 * const MyComponent = () => {
 *   const { addNotification } = useNotificationStore();
 *   
 *   const handleAction = () => {
 *     addNotification({
 *       id: 'notif_1',
 *       title: 'Tiêu đề',
 *       content: 'Nội dung',
 *       sender: 'Người gửi',
 *       timeAgo: '5 phút trước',
 *       timestamp: Date.now(),
 *       read: false,
 *     });
 *   };
 *   
 *   return <Button onPress={handleAction} title="Add Notification" />;
 * };
 */
