import React from 'react';
import {View, Text, StyleSheet, Image, FlatList} from 'react-native';
import images from '../../../assets/images';
import {useAuthStore} from '@/stores/authStore';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

const History = () => {
    const {userInfo} = useAuthStore();
    const fakeHistory = [
        {
            _id: '1',
            title: 'Lịch làm việc',
            content: 'Bạn đã duyệt công việc của cán bộ Trần Văn Bờm.',
            time: '5 phút trước',
        },
        {
            _id: '2',
            title: 'Lịch làm việc',
            content:
                'Bạn đã thiết lập lại tiến độ công việc của cán bộ Trần Văn Hán.',
            time: '25 phút trước',
        },
        {
            _id: '3',
            title: 'Lịch làm việc',
            content: 'Bạn đã huỷ bỏ công việc của Dương Văn Diệu.',
            time: '1 tiếng trước',
        },
        {
            _id: '4',
            title: 'Lịch làm việc',
            content: 'Bạn đã phê duyệt công việc của Hà Hoàng A',
            time: '6 tiếng trước',
        },
        {
            _id: '5',
            title: 'Tài liệu',
            content: 'Bạn đã tạo tài liệu mới cho cán bộ quản lý.',
            time: '4 ngày trước',
        },
        {
            _id: '6',
            title: 'Vật tư',
            content: 'Bạn đã thêm mới một vật tư.',
            time: '3 ngày trước',
        },
        {
            _id: '7',
            title: 'Nhà cung cấp',
            content: 'Bạn đã cập nhật nhà cung cấp.',
            time: '20 ngày trước',
        },
        {
            _id: '8',
            title: 'Nhà cung cấp',
            content: 'Bạn đã cập nhật nhà cung cấp.',
            time: '20 ngày trước',
        },
    ];

    const renderItemHistory = (item: any) => (
        <View style={styles.historyItemContainer}>
            <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                    <Text style={styles.historyItemTitle}>{item.title}</Text>
                    <Text style={styles.historyItemTime}>{item.time}</Text>
                </View>
                <Text style={styles.historyItemContent}>{item.content}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {userInfo.userType.level === EOrganization.LEADER ? (
                <FlatList
                    contentContainerStyle={styles.flatListHistory}
                    data={fakeHistory}
                    renderItem={({item}: any) => renderItemHistory(item)}
                    keyExtractor={item => item._id}
                    //onRefresh={handleReFetch}
                    //refreshing={isLoading}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Image
                                source={images.emptyHistoryList}
                                style={styles.emptyImage}
                                resizeMode='contain'
                            />
                            <Text style={styles.emptyText}>
                                Lịch sử hoạt động trống!
                            </Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Danh sách trống!</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    flatListHistory: {
        flexGrow: 1,
    },
    historyItemContainer: {
        marginLeft: 18,
        borderLeftWidth: 2,
        borderLeftColor: '#4caf50',
    },
    historyItem: {
        gap: 10,
        paddingHorizontal: 15,
        marginBottom: 30,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyItemTitle: {
        fontWeight: '600',
        fontSize: 13,
    },
    historyItemTime: {
        fontStyle: 'italic',
        fontSize: 12.5,
        fontWeight: '500',
        color: '#808080',
    },
    historyItemContent: {
        fontWeight: '400',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImage: {
        height: 180,
    },
    emptyText: {
        textAlign: 'center',
        fontWeight: 400,
        fontSize: 14,
        color: 'rgba(128, 128, 128, 1)',
    },
});

export default History;
