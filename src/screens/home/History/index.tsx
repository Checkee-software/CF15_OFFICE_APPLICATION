/* eslint-disable curly */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image, FlatList} from 'react-native';
import images from '../../../assets/images';
import {useHistoryRecordsStore} from '@/stores/historyRecordsStore';
import Loading from '@/screens/subscreen/Loading';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';

const History = () => {
    const isFocused = useIsFocused();

    const {isLoading, listHistoryRecords, getListHistoryRecord} =
        useHistoryRecordsStore();

    const handleGetHistoryRecord = async () => {
        await getListHistoryRecord();
    };

    const formatTime = (time: Date) => {
        const relativeTime = moment(time).fromNow();
        return relativeTime;
    };

    const renderMessage = (message: string, value: string) => {
        // nếu message có @ thay bằng value
        if (message.includes('@')) {
            return message.replace('@', value);
        }

        // nếu không có @ thì nối thêm value vào cuối
        return `${message} ${value}`;
    };

    const renderItemHistory = (item: any) => (
        <View style={styles.historyItemContainer}>
            <View style={styles.historyItem}>
                <View style={styles.historyHeader}>
                    <Text style={styles.historyItemTitle}>{item.title}</Text>
                    <Text style={styles.historyItemTime}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
                <Text style={styles.historyItemContent}>
                    {renderMessage(item.message, item.value)}
                </Text>
            </View>
        </View>
    );

    useEffect(() => {
        handleGetHistoryRecord();
    }, [isFocused]);

    if (isLoading) return <Loading />;

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.flatListHistory}
                data={listHistoryRecords}
                renderItem={({item}: any) => renderItemHistory(item)}
                keyExtractor={item => item._id}
                onRefresh={handleGetHistoryRecord}
                refreshing={isLoading}
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
