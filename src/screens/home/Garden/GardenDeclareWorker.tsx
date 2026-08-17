/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {useNavigation, useRoute} from "@react-navigation/native";
import ActionButtons from "./ActionButtons";
import {useAuthStore} from "../../../stores/authStore";
import {useWorkScheduleStore} from "../../../stores/workScheduleStore";
import TaskListSection from "./TaskListSection";
import AdditionalSupplySection from "./AdditionalSupplySection";
import MachineShiftSelector from "./MachineShiftSelector";
import {EProcessesType} from "@/shared-types/form-data/ProcessesFormData/ProcessesFormData";
import Backdrop from "../../subscreen/Loading/index2";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Dropdown} from "react-native-element-dropdown";
import Snackbar from "react-native-snackbar";

type TaskInput = {
    taskId: string;
    taskName: string;
    area: string;
    disabled?: boolean;
    taskStatus?: string;
};

type AdditionalSupply = {
    name: string;
    unit: string;
    value: string;
    price: string;
};

const GardenDeclare = () => {
    const [machineShifts, setMachineShifts] = useState<any[]>([
        {processId: "", area: ""},
    ]);
    const [availableMachines, setAvailableMachines] = useState<any[]>([]); //! fix type later
    const [loading, setLoading] = useState(false);
    const [selectedGarden, setSelectedGarden] = useState({
        gardenId: "",
        totalSquare: 0,
        area: 0,
    });

    const handleMachineShiftChange = (
        index: number,
        field: "processId" | "area",
        value: string,
    ) => {
        setMachineShifts(prev => {
            if (!prev[index]) {
                // If prev[index] doesn't exist, you should initialize it as a new object
                const updated = [...prev];
                updated[index] = {...updated[index], [field]: value}; // Add the field if it's undefined
                //console.log('Updated with new object at index:', updated);
                return updated;
            }

            // Proceed with updating if prev[index] exists
            const updated = [...prev];
            updated[index][field] = value;
            //console.log('Updated:', updated);

            return updated;
        });
    };
    const [taskInputs, setTaskInputs] = useState<TaskInput[]>([]);
    const [additionalSupplies, setAdditionalSupplies] = useState<
        AdditionalSupply[]
    >([{name: "", unit: "", value: "", price: ""}]);

    const {userInfo} = useAuthStore();
    const {
        detailWorkSchedule,
        getDetailWorkSchedule,
        requestPersonalTask,
        requestAdditionalMaterial,
    } = useWorkScheduleStore();

    const route = useRoute<any>();
    const id = route.params?.id as string;
    const navigation = useNavigation();
    const hasLogged = useRef(false);
    const [showExitAlert, setShowExitAlert] = useState(false);
    // const [isSaved, setIsSaved] = useState(false);
    const [onlyShowReportButton] = useState(false);
    const [showReportConfirmation, setShowReportConfirmation] = useState(false);

    const handleInputChange = (index: number, field: "area", value: string) => {
        setTaskInputs(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleExit = () => navigation.goBack();

    const isTaskValid = (task: TaskInput) => {
        return !task.disabled && task.area.trim() !== "";
    };

    const handleReport = () => {
        const someTaskValid = taskInputs.some(isTaskValid);
        const someMachineValid = machineShifts.some(isMachineShiftValid);

        if (someTaskValid || someMachineValid) {
            setShowReportConfirmation(true);
        } else {
            setShowExitAlert(true);
        }
    };

    const handleCancelReport = () => setShowReportConfirmation(false);

    const isMachineShiftValid = (shift: any) => {
        return shift?.processId?.trim() !== "" && shift?.area?.trim() !== "";
    };

    const hasDeclarations =
        taskInputs.some(isTaskValid) || machineShifts.some(isMachineShiftValid);

    const handleConfirmReport = async () => {
        setShowReportConfirmation(false);
        if (!detailWorkSchedule?._id) {
            return;
        }

        try {
            setLoading(true);

            const requests = taskInputs.filter(isTaskValid);
            for (const task of requests) {
                const payload = {
                    area: parseFloat(task.area),
                    gardenId: selectedGarden.gardenId,
                };
                // console.log('📤 Gửi lao động:', {
                //     scheduleId: detailWorkSchedule._id,
                //     taskId: task.taskId,
                //     payload,
                // });

                await requestPersonalTask(
                    detailWorkSchedule._id,
                    task.taskId,
                    payload,
                );
            }
            //console.log(isMachineShiftValid);
            for (const shift of machineShifts.filter(isMachineShiftValid)) {
                const matchingTask = detailWorkSchedule.childTasks.find(
                    (task: any) =>
                        task.machines?.some(
                            (machine: any) => machine._id === shift.processId,
                        ),
                );

                if (!matchingTask) {
                    continue;
                }

                const payload = {
                    area: parseFloat(shift.area),
                    gardenId: selectedGarden.gardenId,
                    machineId: shift.processId,
                    type: EProcessesType.CA_MAY,
                };
                console.log("📤 Gửi ca máy:", {
                    scheduleId: detailWorkSchedule._id,
                    taskId: matchingTask._id,
                    payload,
                });

                if (matchingTask._id) {
                    await requestPersonalTask(
                        detailWorkSchedule._id,
                        matchingTask._id,
                        payload,
                    );
                }
            }

            // setIsSaved(true);
            // setTimeout(() => setIsSaved(false), 1000);

            setTaskInputs(prev =>
                prev.map(task => ({
                    ...task,
                    area: "",
                })),
            );

            setMachineShifts(prev =>
                prev.map(shift => ({
                    ...shift,
                    processId: "",
                    area: "",
                })),
            );
        } catch (err) {
            console.error("❌ Lỗi khi gửi báo cáo:", err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    };

    const handleAddSupply = () => {
        setAdditionalSupplies(prev => [
            ...prev,
            {name: "", unit: "", value: "", price: ""},
        ]);
    };

    const handleChangeSupplyField = (
        index: number,
        field: keyof AdditionalSupply,
        value: string,
    ) => {
        setAdditionalSupplies(prev => {
            const updated = [...prev];
            updated[index] = {...updated[index], [field]: value};
            return updated;
        });
    };

    const handleSubmitAdditionalSupplies = async () => {
        if (!detailWorkSchedule?._id) {
            return;
        }

        if (selectedGarden.gardenId === "") {
            Snackbar.show({
                text: "Bạn chưa chọn khu vườn cần gửi đầu tư tăng thêm",
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        try {
            setLoading(true);

            for (const supply of additionalSupplies) {
                await requestAdditionalMaterial(detailWorkSchedule._id, {
                    name: supply.name,
                    unit: supply.unit,
                    value: Number(supply.value),
                    price: Number(supply.price),
                    gardenId: selectedGarden.gardenId,
                });
            }

            setAdditionalSupplies([{name: "", unit: "", value: "", price: ""}]);
        } catch (err) {
            console.error("❌ Lỗi khi gửi vật tư thêm:", err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    };

    useEffect(() => {
        if (id) {
            getDetailWorkSchedule(id, userInfo._id);
        }
    }, []);

    useEffect(() => {
        setSelectedGarden({
            gardenId: "",
            totalSquare: 0,
            area: 0,
        });

        if (detailWorkSchedule && !hasLogged.current) {
            hasLogged.current = true;
        }

        if (
            detailWorkSchedule?.childTasks?.some(task =>
                task?.staff.some(staff => staff?.gardens.length === 1),
            )
        ) {
            setSelectedGarden({
                gardenId:
                    detailWorkSchedule.childTasks[0]?.staff[0]?.gardens[0]
                        ?.gardenId,
                totalSquare:
                    detailWorkSchedule.childTasks[0]?.staff[0].gardens[0]
                        ?.square,
                area: detailWorkSchedule.childTasks[0]?.staff[0].gardens[0]
                    ?.area,
            });
        }
    }, [detailWorkSchedule]);

    useEffect(() => {
        console.log("📦 Chi tiết công việc:", detailWorkSchedule);
        if (detailWorkSchedule?.childTasks?.length) {
            let inputs;
            if (selectedGarden.gardenId === "") {
                inputs = detailWorkSchedule.childTasks.map((task: any) => {
                    const userInTask = task.staff?.find(
                        (s: any) => s.userId === userInfo?._id,
                    );
                    return {
                        taskId: task._id,
                        taskName: task.name,
                        area: "",
                        totalSquare: selectedGarden.totalSquare,
                        currentArea: selectedGarden.area,
                        taskStatus: userInTask?.status || task.status,
                    };
                });
            } else {
                inputs = detailWorkSchedule.childTasks.map((task: any) => {
                    const userInTask = task.staff?.find(
                        (s: any) => s.userId === userInfo?._id,
                    );

                    return {
                        taskId: task._id,
                        taskName: task.name,
                        area: "",
                        totalSquare:
                            userInTask.gardens.find(
                                (g: any) =>
                                    g.gardenId === selectedGarden.gardenId,
                            )?.square || 0,
                        currentArea:
                            userInTask.gardens.find(
                                (g: any) =>
                                    g.gardenId === selectedGarden.gardenId,
                            )?.area || 0,
                        taskStatus: userInTask?.status || task.status,
                    };
                });
            }

            setTaskInputs(inputs);

            const allMachinesWithTaskInfo =
                detailWorkSchedule.childTasks.flatMap(task =>
                    (task.machines || []).map(machine => ({
                        ...machine,
                        childTaskCurrentArea: task.staff[0].processingRate,
                        childTaskId: task._id,
                        childTaskStatus: task.status,
                        childTaskName: task.name,
                        childTaskStaff: task.staff,
                    })),
                );

            //console.log('tất cả ca máy đang có: ', allMachinesWithTaskInfo);

            setAvailableMachines(allMachinesWithTaskInfo);
        }
    }, [detailWorkSchedule, userInfo, selectedGarden, selectedGarden.gardenId]);

    if (!detailWorkSchedule) {
        return (
            <View style={styles.centered}>
                <Text>Đang tải dữ liệu công việc...</Text>
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
            <ActionButtons
                visible={hasDeclarations}
                showAlert={showExitAlert}
                showReportConfirmation={showReportConfirmation}
                onReport={handleReport}
                onExit={handleExit}
                onCloseAlert={() => setShowExitAlert(false)}
                onConfirmReport={handleConfirmReport}
                onCancelReport={handleCancelReport}
                onlyShowReportButton={onlyShowReportButton}
            />
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
                contentContainerStyle={styles.container}
                enableOnAndroid
                extraHeight={150}>
                <View
                    style={[
                        styles.infoContainer,
                        hasDeclarations ? {marginTop: 80} : {marginTop: 0},
                    ]}>
                    <View style={styles.productBox}>
                        <Text style={styles.productLabel}>
                            Cây trồng/Loại cây trồng
                        </Text>
                        <View style={styles.productRow}>
                            <Icon name="group-work" color="green" size={20} />
                            <Text style={styles.productText}>
                                {detailWorkSchedule.productName}
                            </Text>
                        </View>
                    </View>

                    {detailWorkSchedule?.childTasks?.some(task =>
                        task?.staff.some(staff => staff?.gardens.length > 1),
                    ) && (
                        <Dropdown
                            mode="modal"
                            style={styles.dropdown}
                            search
                            searchPlaceholder="Tìm khu vườn"
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            iconStyle={styles.iconStyle}
                            data={
                                detailWorkSchedule?.childTasks[0].staff[0]
                                    .gardens
                            }
                            maxHeight={300}
                            labelField="name"
                            valueField="gardenId"
                            placeholder="Chọn khu vườn cần làm"
                            value={selectedGarden.gardenId}
                            onChange={itemValue =>
                                setSelectedGarden({
                                    gardenId: itemValue.gardenId,
                                    totalSquare: itemValue.square,
                                    area: itemValue.area,
                                })
                            }
                        />
                    )}
                </View>

                {/* <MachineShiftHistorySection
                    shifts={machineShiftHistories}
                    gardenAreaType={detailWorkSchedule?.gardenAreaType || 'ha'}
                /> */}

                <TaskListSection
                    gardenId={selectedGarden.gardenId}
                    taskInputs={taskInputs}
                    handleInputChange={handleInputChange}
                    styles={styles}
                    gardenAreaType={"ha"}
                    gardenArea={
                        //detailWorkSchedule?.childTasks[0].staff[0].totalSquare

                        selectedGarden.totalSquare
                    }
                    processingRate={
                        selectedGarden.area

                        // detailWorkSchedule?.childTasks[0].staff[0]
                        //     .processingRate
                    }
                />

                <MachineShiftSelector
                    gardenId={selectedGarden.gardenId}
                    machines={availableMachines}
                    machineShifts={machineShifts}
                    gardenAreaType={"ha"}
                    onChange={handleMachineShiftChange}
                    gardenArea={selectedGarden.totalSquare}
                    processingRate={selectedGarden.area}
                />

                <AdditionalSupplySection
                    gardenId={selectedGarden.gardenId}
                    supplies={additionalSupplies}
                    onAdd={handleAddSupply}
                    onChange={handleChangeSupplyField}
                    onSubmit={handleSubmitAdditionalSupplies}
                />
            </KeyboardAwareScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.exitButton1}
                    onPress={handleExit}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}>
                        <Icon
                            name="arrow-circle-left"
                            size={22}
                            color="white"
                            style={{marginRight: 10}}
                        />
                        <Text style={styles.exitText1}>Thoát ra</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Backdrop open={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {paddingHorizontal: 16, backgroundColor: "white"},
    centered: {flex: 1, justifyContent: "center", alignItems: "center"},
    infoContainer: {marginBottom: 16},
    gardenName: {fontSize: 20, fontWeight: "bold"},
    gardenCode: {fontSize: 16, color: "green", fontWeight: "bold"},
    productBox: {
        marginTop: 12,
        backgroundColor: "#4CAF5026",
        padding: 10,
        borderRadius: 8,
    },
    productLabel: {fontSize: 14, color: "black"},
    productRow: {flexDirection: "row", alignItems: "center", marginTop: 4},
    productText: {marginLeft: 8, fontSize: 16},
    footer: {padding: 16, borderTopWidth: 1, borderColor: "#eee"},
    exitButton1: {
        padding: 12,
        backgroundColor: "red",
        borderRadius: 26,
        alignItems: "center",
    },
    exitText1: {color: "white", fontWeight: "600", fontSize: 16},
    label: {fontWeight: "500", marginBottom: 4},
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
        height: 55,
        color: "black",
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },

    saveButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
    warningText: {
        color: "red",
        fontSize: 12,
        marginTop: 4,
    },
    dropdown: {
        height: 52,
        minWidth: "100%",
        borderColor: "#9A9A9A",
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginTop: 15,
    },
    placeholderStyle: {
        fontSize: 15,
        color: "#666666",
        fontWeight: 400,
    },
    selectedTextStyle: {
        fontSize: 15,
        fontWeight: 400,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
});

export default GardenDeclare;
