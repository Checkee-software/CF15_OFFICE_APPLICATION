import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import UsageBarChart from './UsageBarChart';
const StatisticResult = () => {
    const stats = [
        {label: 'Số lượng đội sản xuất', value: '3'},
        {label: 'Số lượng thành viên', value: '65'},
        {label: 'Số lượng khu vườn', value: '3'},
        {label: 'Số lượng công việc', value: '4/23'},
    ];

    const tasks = [
        {
            title: 'Triển khai hệ thống CF15 OFFICE với cà phê khoán',
            location: 'Khu vườn cà phê khoán',
            check1: '12',
            check2: '3/8',
            dateRange: '01/01/2025 - 24/02/2025',
        },
        {
            title: 'Thu hoạch cà phê 2',
            location: 'Khu vườn cà phê năm ba',
            check1: '12',
            check2: '3/8',
            dateRange: '01/01/2025 - 24/02/2025',
        },
        {
            title: 'Tổng công tác khu vườn',
            location: 'Khu vườn cà phê năm ba',
            check1: '12',
            check2: '3/8',
            dateRange: '01/01/2025 - 24/02/2025',
        },
        {
            title: 'Thu hoạch cà phê 1',
            location: 'Khu vườn CF-023',
            check1: '12',
            check2: '3/8',
            dateRange: '01/01/2025 - 24/02/2025',
        },
    ];

    return (
        <ScrollView
            contentContainerStyle={{paddingHorizontal: 5, paddingVertical: 8}}>
            <View style={{paddingHorizontal: 16}}>
                <View style={styles.card}>
                    <View style={styles.statBoxContainer}>
                        {stats.map((item, index) => (
                            <View style={styles.statBox} key={index}>
                                <Text style={styles.statBoxLabel}>
                                    {item.label}
                                </Text>
                                <Text style={styles.statBoxValue}>
                                    {item.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{marginVertical: 16}}>
                    <Text style={{fontWeight: 'bold'}}>
                        Biểu đồ quy trình sử dụng
                    </Text>
                    <Text style={{fontSize: 24, fontWeight: 'bold'}}>
                        57.588.045
                    </Text>
                    <Text style={{fontSize: 12, color: '#888'}}>vnd</Text>
                </View>

                <View style={styles.chart}>
                    <UsageBarChart />
                </View>

                <View style={styles.taskListContainer}>
                    {tasks.map((task, index) => (
                        <View key={index} style={styles.taskItem}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <Text style={styles.taskLocation}>
                                {task.location}
                            </Text>

                            <View style={styles.taskStatusRow}>
                                <View style={styles.statusItem}>
                                    <MaterialIcons
                                        name='people'
                                        size={16}
                                        color='#666'
                                    />
                                    <Text style={styles.taskStatusText}>
                                        {' '}
                                        {task.check1}
                                    </Text>
                                </View>
                                <View style={styles.statusItem}>
                                    <MaterialIcons
                                        name='checklist'
                                        size={16}
                                        color='#666'
                                    />
                                    <Text style={styles.taskStatusText}>
                                        {' '}
                                        {task.check2}
                                    </Text>
                                </View>
                                <View style={styles.statusItem}>
                                    <AntDesign
                                        name='clockcircle'
                                        size={14}
                                        color='#666'
                                    />
                                    <Text style={styles.taskDateText}>
                                        {' '}
                                        {task.dateRange}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    chart: {
        height: 300,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        marginTop: 8,
    },
    statBoxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
        columnGap: 12,
    },
    statBox: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        alignItems: 'center',
    },
    statBoxLabel: {
        fontSize: 12,
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    statBoxValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
        textAlign: 'center',
    },
    taskCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    taskStatusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskCheck: {
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    taskCheckText: {
        fontSize: 14,
    },
    taskDate: {
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    taskListContainer: {
        marginTop: 20,
    },
    taskItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    taskLocation: {
        fontSize: 14,
        color: 'green',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    taskStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskStatusText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 4,
    },
    taskDateText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
});

export default StatisticResult;
