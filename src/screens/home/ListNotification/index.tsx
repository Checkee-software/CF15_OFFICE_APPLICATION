import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import images from '@/assets/images';
import moment from 'moment';
import useNotificationStore from '@/stores/notificationStore';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';

const ListNotification = ({navigation}: any) => {
    const route = useRoute();
    const {notifications = [], unreadCount = 0}: any = route.params || {};
    const {markAsRead, markAllAsRead, bellNotifications} =
        useNotificationStore();

    const handlePressItem = async (item: any) => {
        if (!item.isRead) {
            await markAsRead(item._id);
        }
        switch (item.type) {
            case 'DOCUMENT':
                navigation.navigate(SCREEN_INFO.DOCUMENT.key, {
                    _id: item.referenceId,
                });
                break;
            case 'FEEDBACK':
                navigation.navigate(SCREEN_INFO.FEEDBACK.key, {
                    _id: item.referenceId,
                });
                break;
            case 'SCHEDULE':
                navigation.navigate(SCREEN_INFO.WORKSCHEDULE.key, {
                    _id: item.referenceId,
                });
                break;
            default:
                break;
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const renderItem = ({item}: any) => {
        const formattedTime = moment(item.createdAt).fromNow();

        return (
            <TouchableOpacity
                onPress={() => handlePressItem(item)}
                style={[
                    NotificationStyle.cardNotifi,
                    item.isRead && NotificationStyle.readCard,
                ]}>
                <View style={NotificationStyle.headerNotifi}>
                    <View style={NotificationStyle.warpLeftHeader}>
                        <Text style={NotificationStyle.headerLabel}>
                            {item.title || 'Thông báo'}
                        </Text>
                    </View>
                    <Text style={NotificationStyle.notifiTime}>
                        {formattedTime}
                    </Text>
                </View>

                <View style={NotificationStyle.notifiContent}>
                    <Text style={NotificationStyle.notifiContentText}>
                        {item.body}
                    </Text>
                    <Text
                        style={[
                            NotificationStyle.notifiContentText,
                            {textAlign: 'right'},
                        ]}>
                        {item.actor?.fullName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={NotificationStyle.container}>
            <TouchableOpacity onPress={handleMarkAllAsRead}>
                <Text style={NotificationStyle.linkText}>Đánh dấu đã đọc</Text>
            </TouchableOpacity>

            <View style={NotificationStyle.warpNotifi}>
                <FlatList
                    data={
                        bellNotifications.length > 0
                            ? bellNotifications
                            : notifications
                    }
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={
                        NotificationStyle.flatListNotification
                    }
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={NotificationStyle.emptyListNotifyView}>
                            <Image
                                source={images.emptyNotificationList}
                                style={NotificationStyle.emptyImage}
                                resizeMode='contain'
                            />
                            <Text style={NotificationStyle.emptyListNotifyText}>
                                Hiện tại bạn không có thông báo!
                            </Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};

const NotificationStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    warpNotifi: {
        flex: 1,
        marginTop: 10,
    },
    flatListNotification: {
        paddingBottom: 20,
    },
    cardNotifi: {
        backgroundColor: '#F9F9F9',
        padding: 12,
        marginBottom: 10,
        gap: 10,
    },
    readCard: {
        opacity: 0.4,
    },

    headerNotifi: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    warpLeftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    notifiTime: {
        fontSize: 12,
        color: 'gray',
    },
    notifiContent: {
        marginTop: 6,
    },
    notifiContentText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    emptyListNotifyView: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    emptyImage: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    emptyListNotifyText: {
        color: 'gray',
        fontSize: 14,
    },
    linkText: {
        color: '#2196F3',
        textDecorationLine: 'underline',
        textAlign: 'right',
        marginTop: 8,
    },
});

export default ListNotification;
