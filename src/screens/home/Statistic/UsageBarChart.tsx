import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';

const UsageBarChart = () => {
    const months = [
        'T1',
        'T2',
        'T3',
        'T4',
        'T5',
        'T6',
        'T7',
        'T8',
        'T9',
        'T10',
        'T11',
        'T12',
    ];

    const barWidth = 14;
    const barSpacing = 6;

    const groupedData = months.flatMap((month, index) => [
        {value: Math.random() * 8000, frontColor: '#FF4C4C'},
        {value: Math.random() * 8000, label: month, frontColor: '#4CAF50'},
        {value: Math.random() * 8000, frontColor: '#2196F3'},
        ...(index < months.length - 1 ? [{value: 0, spacing: 20}] : []),
    ]);

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                    data={groupedData}
                    barWidth={14}
                    spacing={10}
                    maxValue={8000}
                    noOfSections={4}
                    yAxisThickness={1}
                    xAxisLabelTextStyle={{fontSize: 10}}
                    width={groupedData.length * 28}
                />
            </ScrollView>

            <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                    <View
                        style={[styles.legendDot, {backgroundColor: '#FF4C4C'}]}
                    />
                    <Text style={styles.legendText}>Nhân công</Text>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[styles.legendDot, {backgroundColor: '#4CAF50'}]}
                    />
                    <Text style={styles.legendText}>Vật tư</Text>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[styles.legendDot, {backgroundColor: '#2196F3'}]}
                    />
                    <Text style={styles.legendText}>Ca máy</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 2,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#333',
    },
});

export default UsageBarChart;
