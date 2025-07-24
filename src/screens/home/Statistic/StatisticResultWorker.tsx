/* eslint-disable react-native/no-inline-styles */
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import {useStatisticStore} from '@/stores/statisticStore';
import {BarChart, PieChart} from 'react-native-gifted-charts';

const StatisticResultWorker = (props: any) => {
    const {statisticData, isLoading} = useStatisticStore();

    const formatVND = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0, // không hiển thị số lẻ
        }).format(value);
    };

    // Hàm format đơn vị tiền
    const formatCurrency = (value: number) => {
        if (value >= 1_000_000_000)
            return `${Math.round(value / 1_000_000_000)} tỷ`;
        if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}tr`;
        if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
        return `${value}`;
    };

    // Lấy max _realValue
    const maxRealValue = Math.max(
        ...(statisticData?.chart ?? []).map(item => item._realValue ?? 0),
    );

    // Chia làm 5 mốc từ 0 đến maxRealValue
    const numberOfSteps = 5;
    const step = maxRealValue / (numberOfSteps - 1);

    // Tạo mảng yAxisLabelTexts có 5 giá trị
    const yAxisLabelTexts = Array.from({length: numberOfSteps}, (_, i) =>
        formatCurrency(Math.round(i * step)),
    );

    return (
        !isLoading && (
            <View style={styles.container}>
                {props.selectedType === 'DISPLAY' ? (
                    statisticData?.pieChart.length !== 0 ? (
                        <View style={{marginVertical: 20, gap: 30}}>
                            <View style={{flexDirection: 'row', gap: 15}}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 5,
                                    }}>
                                    <View
                                        style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: '#FF4E45',
                                            borderRadius: 6,
                                        }}
                                    />

                                    <Text>Chưa làm</Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 5,
                                    }}>
                                    <View
                                        style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: '#4CAF50',
                                            borderRadius: 6,
                                        }}
                                    />

                                    <Text>Đã làm</Text>
                                </View>
                            </View>

                            {statisticData?.pieChart.map(
                                (item: any, index: number) => {
                                    const labelsPosition =
                                        item.percentage === 100
                                            ? 'inward'
                                            : 'mid';

                                    return (
                                        <View
                                            style={styles.pieChartView}
                                            key={index}>
                                            <PieChart
                                                showText
                                                textColor='white'
                                                fontWeight='500'
                                                radius={80}
                                                innerRadius={30}
                                                labelsPosition={labelsPosition}
                                                textSize={14}
                                                // textBackgroundRadius={26}
                                                data={item?.pieChart}
                                            />
                                            <Text style={{textAlign: 'center'}}>
                                                {`${item.taskName} ${item.processingRate}/${item.totalSquare} (ha)`}
                                            </Text>
                                        </View>
                                    );
                                },
                            )}
                        </View>
                    ) : (
                        <Text style={styles.emptyDataText}>
                            Không có dữ liệu thống kê
                        </Text>
                    )
                ) : statisticData?.list.length !== 0 &&
                  statisticData?.chart.length !== 0 ? (
                    <View>
                        <View style={styles.chartSection}>
                            {statisticData?.chart.length !== 0 ? (
                                <>
                                    {/* <Text style={styles.chartLabel}>Biểu đồ quy trình sử dụng</Text>
                                <Text style={styles.chartValue}>57.588.045</Text>
                                <Text style={styles.currency}>vnđ</Text> */}

                                    <View style={styles.chart}>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={
                                                false
                                            }>
                                            <BarChart
                                                data={statisticData?.chart}
                                                barWidth={14}
                                                spacing={10}
                                                labelWidth={120}
                                                maxValue={100}
                                                initialSpacing={15}
                                                //yAxisLabelTexts={['0', '25%', '50%', '75%', '100%']}
                                                yAxisLabelTexts={
                                                    yAxisLabelTexts
                                                }
                                                noOfSections={4}
                                                yAxisThickness={1}
                                                xAxisLabelTextStyle={{
                                                    fontSize: 11,
                                                    textAlign: 'left',
                                                }}
                                                width={
                                                    (statisticData?.chart
                                                        ?.length ?? 0) * 100
                                                }
                                                yAxisLabelWidth={45}
                                                yAxisExtraHeight={40}
                                                renderTooltip={(item: any) => (
                                                    <View
                                                        style={
                                                            styles.chartTooltip
                                                        }>
                                                        <Text
                                                            style={
                                                                styles.tooltipText
                                                            }>
                                                            {formatVND(
                                                                item._realValue ??
                                                                    item.value,
                                                            )}
                                                        </Text>
                                                    </View>
                                                )}
                                            />
                                        </ScrollView>

                                        <View style={styles.legendRow}>
                                            <View style={styles.legendItem}>
                                                <View
                                                    style={[
                                                        styles.legendDot,
                                                        {
                                                            backgroundColor:
                                                                '#FF4C4C',
                                                        },
                                                    ]}
                                                />
                                                <Text style={styles.legendText}>
                                                    Nhân công
                                                </Text>
                                            </View>
                                            <View style={styles.legendItem}>
                                                <View
                                                    style={[
                                                        styles.legendDot,
                                                        {
                                                            backgroundColor:
                                                                '#4CAF50',
                                                        },
                                                    ]}
                                                />
                                                <Text style={styles.legendText}>
                                                    Vật tư
                                                </Text>
                                            </View>
                                            <View style={styles.legendItem}>
                                                <View
                                                    style={[
                                                        styles.legendDot,
                                                        {
                                                            backgroundColor:
                                                                '#2196F3',
                                                        },
                                                    ]}
                                                />
                                                <Text style={styles.legendText}>
                                                    Ca máy
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </>
                            ) : null}
                        </View>

                        <View style={styles.taskListContainer}>
                            {statisticData?.list.map((task, index) => (
                                <View key={index} style={styles.taskItem}>
                                    <Text style={styles.taskTitle}>
                                        {task.title}
                                    </Text>
                                    <Text style={styles.taskLocation}>
                                        {task.gardenName}
                                    </Text>

                                    <View style={styles.taskCosts}>
                                        <Text style={styles.costText}>
                                            Chi phí nhân công: {''}
                                            <Text style={styles.costValue}>
                                                {new Intl.NumberFormat(
                                                    'vi-VN',
                                                    {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    },
                                                ).format(task?.labourCost ?? 0)}
                                            </Text>
                                        </Text>
                                        <Text style={styles.costText}>
                                            Chi phí vật tư: {''}
                                            <Text style={styles.costValue}>
                                                {new Intl.NumberFormat(
                                                    'vi-VN',
                                                    {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    },
                                                ).format(
                                                    task?.materialCost ?? 0,
                                                )}
                                            </Text>
                                        </Text>
                                        <Text style={styles.costText}>
                                            Chi phí ca máy: {''}
                                            <Text style={styles.costValue}>
                                                {new Intl.NumberFormat(
                                                    'vi-VN',
                                                    {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    },
                                                ).format(
                                                    task?.machineCost ?? 0,
                                                )}
                                            </Text>
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <Text style={styles.emptyDataText}>
                        Không có dữ liệu thống kê
                    </Text>
                )}
            </View>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listCard: {
        marginVertical: 15,
        gap: 10,
    },
    card: {
        backgroundColor: '#fff',
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
    chartSection: {
        marginVertical: 10,
    },
    chartLabel: {
        fontSize: 15,
        fontWeight: 500,
    },
    chartValue: {
        fontSize: 24,
        fontWeight: 600,
    },
    currency: {
        color: '#4F4F4F',
        fontSize: 12,
        fontWeight: 400,
    },
    chart: {
        marginTop: 10,
        height: 310,
    },
    chartTooltip: {
        padding: 6,
        backgroundColor: '#5A5A5B',
        borderRadius: 8,
    },
    tooltipText: {
        color: '#fff',
        fontWeight: 500,
        fontSize: 13,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
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
    taskListContainer: {
        marginVertical: 10,
        gap: 5,
    },
    taskItem: {
        backgroundColor: '#F5F5F5',
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
    },
    taskCosts: {
        marginVertical: 5,
    },
    costText: {
        fontSize: 13,
        fontWeight: 500,
        color: '#808080',
    },
    costValue: {
        color: 'black',
    },
    pieChartView: {
        gap: 8,
        alignItems: 'center',
    },
    emptyDataText: {
        margin: 'auto',
        textAlign: 'center',
        fontWeight: 500,
    },
});

export default StatisticResultWorker;
