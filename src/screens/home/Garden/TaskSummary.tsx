import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskSummary = ({
    title,
    data,
    index,
    onRemove,
}: {
    title: string;
    data: any;
    index: number;
    onRemove: (index: number) => void;
}) => {
    const formatTime = (date: Date) => {
        const d = new Date(date);
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${h}:${m} ${day}/${month}/${year}`;
    };

    return (
        <View
            style={[
                styles.taskBlock,
                styles.summaryBox,
                styles.summaryBoxHarvest,
            ]}>
            <View style={styles.summaryHeader}>
                <Text style={styles.taskTitle}>{title}</Text>
                <TouchableOpacity onPress={() => onRemove(index)}>
                    <Icon name='delete' size={20} color='gray' />
                </TouchableOpacity>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.label}>Thực hiện lúc</Text>
                <Text style={styles.value}>{formatTime(data.time)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.label}>Khối lượng (KG)</Text>
                <Text style={styles.value}>{data.value}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    taskBlock: {
        backgroundColor: '#4CAF5026',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    taskTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        marginTop: 6,
        marginBottom: 4,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
    },
    summaryBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#4CAF50',
        backgroundColor: '#f9f9f9',
    },
    summaryBoxHarvest: {
        borderColor: '#2196F3',
    },
});

export default TaskSummary;
