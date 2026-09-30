import {View, Text, StyleSheet, ScrollView} from "react-native";
import React from "react";
import {useStatisticStore} from "@/stores/statisticStore";
import {BarChart, PieChart} from "react-native-gifted-charts";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const StatisticResultWorker = (props: any) => {
    const {statisticData, isLoading} = useStatisticStore();

    const formatVND = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0, // không hiển thị số lẻ
        }).format(value);
    };

    // Hàm format đơn vị tiền
    const formatCurrency = (value: number) => {
        if (value >= 1_000_000_000) {
            return `${Math.round(value / 1_000_000_000)} tỷ`;
        }
        if (value >= 1_000_000) {
            return `${Math.round(value / 1_000_000)}tr`;
        }
        if (value >= 1_000) {
            return `${Math.round(value / 1_000)}k`;
        }
        return `${value}`;
    };

    // Lấy max _realValue
    const maxRealValue = Math.max(
        ...(statisticData?.chart ?? []).map((item: any) => item._realValue ?? 0),
    );

    // Chia làm 5 mốc từ 0 đến maxRealValue
    const numberOfSteps = 5;
    const step = maxRealValue / (numberOfSteps - 1);

    // Tạo mảng yAxisLabelTexts có 5 giá trị
    const yAxisLabelTexts = Array.from({length: numberOfSteps}, (_, i) =>
        formatCurrency(Math.round(i * step)),
    );

    if (isLoading) {
        return null;
    }

    return (
        <View style={styles.container}>
                {props.selectedType === "DISPLAY" ? (
                    (() => {
                        const progressList = Array.isArray(
                            statisticData?.pieChart,
                        )
                            ? statisticData.pieChart
                            : [];
                        const hasProgressData = progressList.some(
                            (item: any) =>
                                item.tasks ? item.tasks.length > 0 : true,
                        );

                        if (!hasProgressData || progressList.length === 0) {
                            return (
                                <Text style={styles.emptyDataText}>
                                    Không có dữ liệu thống kê
                                </Text>
                            );
                        }

                        return (
                            <View style={styles.displaySectionContainer}>
                                <View style={styles.legendContainer}>
                                    <View style={styles.legendItemBadge}>
                                        <View
                                            style={[
                                                styles.legendDotIndicator,
                                                {backgroundColor: "#4CAF50"},
                                            ]}
                                        />
                                        <Text style={styles.legendTextBadge}>
                                            Đã làm
                                        </Text>
                                    </View>

                                    <View style={styles.legendItemBadge}>
                                        <View
                                            style={[
                                                styles.legendDotIndicator,
                                                {backgroundColor: "#FF4E45"},
                                            ]}
                                        />
                                        <Text style={styles.legendTextBadge}>
                                            Chưa làm
                                        </Text>
                                    </View>
                                </View>

                                {progressList.map(
                                    (processItem: any, pIndex: number) => {
                                        const tasks = Array.isArray(
                                            processItem.tasks,
                                        )
                                            ? processItem.tasks
                                            : [processItem];

                                        if (tasks.length === 0) return null;

                                        return (
                                            <View
                                                style={styles.processGroupCard}
                                                key={pIndex}>
                                                {processItem.processTitle ? (
                                                    <View
                                                        style={
                                                            styles.processGroupHeader
                                                        }>
                                                        <MaterialIcons
                                                            name="assignment"
                                                            size={20}
                                                            color="#2E7D32"
                                                        />
                                                        <Text
                                                            style={
                                                                styles.processGroupTitle
                                                            }>
                                                            {
                                                                processItem.processTitle
                                                            }
                                                        </Text>
                                                    </View>
                                                ) : null}

                                                <View
                                                    style={
                                                        styles.processTasksGrid
                                                    }>
                                                    {tasks.map(
                                                        (
                                                            taskItem: any,
                                                            tIndex: number,
                                                        ) => {
                                                            const labelsPosition =
                                                                taskItem.percentage ===
                                                                    100 ||
                                                                taskItem.percentage ===
                                                                    0
                                                                    ? "inward"
                                                                    : "mid";
                                                            const rate =
                                                                taskItem.totalProcessingRate ??
                                                                taskItem.processingRate ??
                                                                0;
                                                            const square =
                                                                taskItem.totalSquare ??
                                                                0;

                                                            return (
                                                                <View
                                                                    style={
                                                                        styles.taskCardItem
                                                                    }
                                                                    key={
                                                                        tIndex
                                                                    }>
                                                                    <PieChart
                                                                        showText
                                                                        textColor="white"
                                                                        fontWeight="600"
                                                                        radius={
                                                                            70
                                                                        }
                                                                        innerRadius={
                                                                            28
                                                                        }
                                                                        labelsPosition={
                                                                            labelsPosition
                                                                        }
                                                                        textSize={
                                                                            13
                                                                        }
                                                                        data={
                                                                            taskItem?.pieChart
                                                                        }
                                                                    />
                                                                    <View
                                                                        style={
                                                                            styles.taskMeta
                                                                        }>
                                                                        <Text
                                                                            style={
                                                                                styles.taskNameLabel
                                                                            }>
                                                                            {
                                                                                taskItem.taskName
                                                                            }
                                                                        </Text>
                                                                        <View
                                                                            style={
                                                                                styles.taskProgressBadge
                                                                            }>
                                                                            <Text
                                                                                style={
                                                                                    styles.taskProgressText
                                                                                }>
                                                                                <Text
                                                                                    style={
                                                                                        styles.taskProgressHighlight
                                                                                    }>
                                                                                    {
                                                                                        rate
                                                                                    }
                                                                                </Text>
                                                                                /{square} ha ({taskItem.percentage}%)
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            );
                                                        },
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    },
                                )}
                            </View>
                        );
                    })()
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
                                                    textAlign: "left",
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
                                                                "#FF4C4C",
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
                                                                "#4CAF50",
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
                                                                "#2196F3",
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
                            {statisticData?.list.map((task: any, index: number) => (
                                <View key={index} style={styles.taskItem}>
                                    <Text style={styles.taskTitle}>
                                        {task.title}
                                    </Text>
                                    <Text style={styles.taskLocation}>
                                        {task.gardenName}
                                    </Text>

                                    <View style={styles.taskCosts}>
                                        <Text style={styles.costText}>
                                            Chi phí nhân công: {""}
                                            <Text style={styles.costValue}>
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    },
                                                ).format(task?.labourCost ?? 0)}
                                            </Text>
                                        </Text>
                                        <Text style={styles.costText}>
                                            Chi phí vật tư: {""}
                                            <Text style={styles.costValue}>
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    },
                                                ).format(
                                                    task?.materialCost ?? 0,
                                                )}
                                            </Text>
                                        </Text>
                                        <Text style={styles.costText}>
                                            Chi phí ca máy: {""}
                                            <Text style={styles.costValue}>
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
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
        );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignSelf: "stretch",
    },
    listCard: {
        marginVertical: 15,
        gap: 10,
    },
    card: {
        backgroundColor: "#fff",
    },
    statBoxContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
        columnGap: 12,
    },
    statBox: {
        width: "48%",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: "#fff",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        alignItems: "center",
    },
    statBoxLabel: {
        fontSize: 12,
        color: "#333",
        marginBottom: 4,
        textAlign: "center",
    },
    statBoxValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4CAF50",
        textAlign: "center",
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
        color: "#4F4F4F",
        fontSize: 12,
        fontWeight: 400,
    },
    chart: {
        marginTop: 10,
        height: 310,
    },
    chartTooltip: {
        padding: 6,
        backgroundColor: "#5A5A5B",
        borderRadius: 8,
    },
    tooltipText: {
        color: "#fff",
        fontWeight: 500,
        fontSize: 13,
    },
    legendRow: {
        flexDirection: "row",
        justifyContent: "center",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
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
        color: "#333",
    },
    taskListContainer: {
        marginVertical: 10,
        gap: 5,
    },
    taskItem: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 4,
    },
    taskLocation: {
        fontSize: 14,
        color: "green",
        fontStyle: "italic",
    },
    taskCosts: {
        marginVertical: 5,
    },
    costText: {
        fontSize: 13,
        fontWeight: 500,
        color: "#808080",
    },
    costValue: {
        color: "black",
    },
    pieChartView: {
        gap: 8,
        alignItems: "center",
    },
    displaySectionContainer: {
        marginVertical: 14,
        width: "100%",
        alignSelf: "stretch",
        gap: 16,
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#F9F9F9",
        borderRadius: 24,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#EAEAEA",
    },
    legendItemBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    legendDotIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendTextBadge: {
        fontSize: 13,
        fontWeight: "600",
        color: "#424242",
    },
    processGroupCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        width: "100%",
        alignSelf: "stretch",
        borderWidth: 1,
        borderColor: "#E8ECE9",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        gap: 16,
    },
    processGroupHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#E8F5E9",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    processGroupTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1B5E20",
        flex: 1,
    },
    processTasksGrid: {
        gap: 16,
    },
    taskCardItem: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        alignSelf: "stretch",
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "#FAFAFA",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        gap: 12,
    },
    taskMeta: {
        alignItems: "center",
        gap: 4,
        width: "100%",
        paddingHorizontal: 10,
    },
    taskNameLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#212121",
        textAlign: "center",
    },
    taskProgressBadge: {
        backgroundColor: "#F1F8E9",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#C8E6C9",
    },
    taskProgressText: {
        fontSize: 13,
        color: "#555",
        fontWeight: "500",
    },
    taskProgressHighlight: {
        color: "#2E7D32",
        fontWeight: "700",
    },
    emptyDataText: {
        margin: "auto",
        textAlign: "center",
        fontWeight: 500,
    },
});

export default StatisticResultWorker;
