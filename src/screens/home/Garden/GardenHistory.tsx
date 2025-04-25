'use client';

import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';

const STATUS_COLORS = {
    approved: '#4CAF50',
    pending: '#FFA500',
    canceled: '#F44336',
};

const GardenHistory = () => {
    const [activities, setActivities] = useState([
        {
            date: '19/04/2025',
            items: [
                {
                    type: 'Bón phân',
                    status: 'Đã duyệt',
                    statusKey: 'approved',
                    approver: 'Ngô Trọng Ẩn',
                    time: '09:00 19/04/2025',
                    quotaType: 'Phân khô',
                    quota: 1.5,
                },
                {
                    type: 'Phun thuốc',
                    status: 'Chờ xét duyệt',
                    statusKey: 'pending',
                    time: '14:00 19/04/2025',
                    quotaType: 'Thuốc trừ sâu',
                    quota: 1.5,
                },
                {
                    type: 'Phun thuốc',
                    status: 'Đã huỷ',
                    statusKey: 'canceled',
                    approver: 'Ngô Trọng Ẩn',
                    reason: 'Không tưới nước đủ khu vực mình đảm nhiệm',
                    time: '14:00 19/04/2025',
                    quotaType: 'Thuốc trừ sâu',
                    quota: 1.5,
                },
            ],
        },
        {
            date: '17/04/2025',
            items: [
                {
                    type: 'Bón phân',
                    status: 'Đã duyệt',
                    statusKey: 'approved',
                    approver: 'Ngô Trọng Ẩn',
                    time: '13:43 19/04/2025',
                    quotaType: 'Phân khô',
                    quota: 1.5,
                },
            ],
        },
    ]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle='dark-content' backgroundColor='#FFFFFF' />
            <View style={styles.header}>
                <Text style={styles.linkText}>{'< '}Lịch sử khai báo</Text>
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}>
                {activities.map((day, index) => (
                    <View key={index} style={styles.dayContainer}>
                        <Text style={styles.dateText}>Ngày {day.date}</Text>

                        {day.items.map((item, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.card,
                                    {
                                        borderColor:
                                            STATUS_COLORS[item.statusKey],
                                    },
                                ]}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.typeText}>
                                        {item.type}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color: STATUS_COLORS[
                                                    item.statusKey
                                                ],
                                            },
                                        ]}>
                                        {item.status}
                                    </Text>
                                </View>

                                {item.approver && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>
                                            Người duyệt
                                        </Text>
                                        <Text style={styles.valueBlue}>
                                            {item.approver}
                                        </Text>
                                    </View>
                                )}

                                {item.reason && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>
                                            Lí do huỷ
                                        </Text>
                                        <Text
                                            style={[
                                                styles.valueRed,
                                                styles.reasonText,
                                            ]}>
                                            {item.reason}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.row}>
                                    <Text style={styles.label}>
                                        Thực hiện lúc
                                    </Text>
                                    <Text style={styles.value}>
                                        {item.time}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>
                                        Loại định mức
                                    </Text>
                                    <Text style={styles.value}>
                                        {item.quotaType}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Định mức</Text>
                                    <Text style={styles.value}>
                                        {item.quota}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
    },
    dayContainer: {
        marginBottom: 10,
    },
    linkText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
        marginVertical: 16,
        textAlign: 'center',
        color: '#000000',
    },
    card: {
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderStyle: 'dashed',
        backgroundColor: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center',
    },
    typeText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#000000',
    },
    statusText: {
        fontWeight: '500',
        fontSize: 15,
    },
    label: {
        fontSize: 14,
        color: '#666666',
    },
    value: {
        fontWeight: '500',
        fontSize: 14,
        color: '#000000',
        textAlign: 'right',
    },
    valueBlue: {
        fontWeight: '500',
        fontSize: 14,
        color: '#2196F3',
        textAlign: 'right',
    },
    valueRed: {
        fontWeight: '500',
        fontSize: 14,
        color: '#F44336',
        textAlign: 'right',
    },
    reasonText: {
        maxWidth: '60%',
    },
    bottomPadding: {
        height: 20,
    },
});

export default GardenHistory;
