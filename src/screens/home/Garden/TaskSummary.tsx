import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskSummary = ({
    title,
    data,
    index,
    onRemove,
    itemMap = {},
    typeMap = {},
}: {
    title: string;
    data: any;
    index: number;
    onRemove: (index: number) => void;
    itemMap?: {[key: string]: string};
    typeMap?: {[key: string]: string};
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

    const renderHarvestDetails = (data: any) => {
        if (title === 'Thu hoạch') {
            return (
                <>
                    <View style={styles.summaryRow}>
                        <Text style={styles.label}>Khối lượng (KG)</Text>
                        <Text style={styles.value}>
                            {data.value} 
                        </Text>
                    </View>
                </>
            );
        }
        return (
            <>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Loại vật tư</Text>
                    <Text style={styles.value}>
                        {itemMap[data.item] || data.item}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Định mức</Text>
                    <Text style={styles.value}>
                        {data.value} / {typeMap?.[data.type] || data.type}
                    </Text>
                </View>
            </>
        );
    };

    return (
        <View
            style={[
                styles.taskBlock,
                styles.summaryBox,
                title === 'Thu hoạch'
                    ? styles.summaryBoxHarvest
                    : styles.summaryBoxDefault,
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
            {renderHarvestDetails(data)}
        </View>
    );
};

const styles = StyleSheet.create({

    productBox: {
        marginTop: 12,
        backgroundColor: '#4CAF5026',
        padding: 10,
        borderRadius: 6,
    },
    productLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    taskHeader: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
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
    dropdown: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'gray',
        paddingHorizontal: 12,
        height: 40,
    },
    declareButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        alignItems: 'center',
        borderRadius: 6,
        marginTop: 12,
    },
    declareText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    exitButton: {
        backgroundColor: 'red',
        padding: 12,
        alignItems: 'center',
        borderRadius: 24,
        marginTop: 16,
    },
    exitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
    requiredMark: {
        color: 'red',
    },
    summaryBoxDefault: {
        borderColor: '#4CAF50',
    },
    summaryBoxHarvest: {
        borderColor: '#2196F3',
    },
});

export default TaskSummary;
